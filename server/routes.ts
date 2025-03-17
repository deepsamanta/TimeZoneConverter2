import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversionSchema, insertFavoriteSchema } from "@shared/schema";
import { parse, format } from "date-fns";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Timezone List API
  app.get("/api/timezones", (_req: Request, res: Response) => {
    const timezones = [
      { value: "Asia/Kolkata", label: "New Delhi (IST)", offset: "+5:30" },
      { value: "America/New_York", label: "New York (EDT/EST)", offset: "-4:00" },
      { value: "EST", label: "Eastern Standard Time (EST)", offset: "-5:00" },
      { value: "EDT", label: "Eastern Daylight Time (EDT)", offset: "-4:00" },
      { value: "Europe/London", label: "London (BST/GMT)", offset: "+1:00" },
      { value: "Europe/Paris", label: "Paris (CEST/CET)", offset: "+2:00" },
      { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "+9:00" },
      { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)", offset: "+10:00" },
      { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)", offset: "+12:00" },
      { value: "America/Los_Angeles", label: "Los Angeles (PDT/PST)", offset: "-7:00" },
      { value: "Asia/Dubai", label: "Dubai (GST)", offset: "+4:00" },
      { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "+8:00" }
    ];
    
    res.json(timezones);
  });

  // Favorites API
  app.get("/api/favorites", async (_req: Request, res: Response) => {
    try {
      const favorites = await storage.getFavorites();
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.createFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid favorite data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create favorite" });
      }
    }
  });

  app.delete("/api/favorites/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteFavorite(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete favorite" });
    }
  });

  // Conversions History API
  app.get("/api/conversions", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const conversions = await storage.getConversions(limit);
      res.json(conversions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversion history" });
    }
  });

  app.post("/api/conversions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertConversionSchema.parse(req.body);
      const conversion = await storage.createConversion(validatedData);
      res.status(201).json(conversion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid conversion data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save conversion" });
      }
    }
  });

  app.delete("/api/conversions", async (_req: Request, res: Response) => {
    try {
      const success = await storage.clearConversions();
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to clear conversion history" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to clear conversion history" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
