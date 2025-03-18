import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversionSchema, insertFavoriteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Timezone List API
  app.get("/api/timezones", (_req: Request, res: Response) => {
    // Define timezones with their display names
    const timezoneDefinitions = [
      { value: "Asia/Kolkata", label: "New Delhi (IST)" },
      { value: "America/New_York", label: "New York (EDT/EST)" },
      { value: "America/Chicago", label: "Chicago (CDT/CST)" },
      { value: "America/Denver", label: "Denver (MDT/MST)" },
      { value: "America/Los_Angeles", label: "Los Angeles (PDT/PST)" },
      { value: "Europe/London", label: "London (BST/GMT)" },
      { value: "Europe/Paris", label: "Paris (CEST/CET)" },
      { value: "Europe/Berlin", label: "Berlin (CEST/CET)" },
      { value: "Asia/Tokyo", label: "Tokyo (JST)" },
      { value: "Asia/Singapore", label: "Singapore (SGT)" },
      { value: "Asia/Dubai", label: "Dubai (GST)" },
      { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
      { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" }
    ];

    // Calculate current offsets for each timezone
    const currentDate = new Date();

    const timezones = timezoneDefinitions.map(tz => {
      // Calculate offset using current date to account for DST
      const localDate = new Date(currentDate);

      try {
        // Calculate the UTC offset for this timezone
        // We're doing this on the server-side for consistency
        const timezoneDate = new Date(localDate.toLocaleString('en-US', { timeZone: tz.value }));
        const diffInMinutes = (timezoneDate.getTime() - localDate.getTime()) / (1000 * 60);

        // Format the offset string
        const offsetHours = Math.floor(Math.abs(diffInMinutes) / 60);
        const offsetMinutes = Math.abs(diffInMinutes) % 60;
        const sign = diffInMinutes >= 0 ? '+' : '-';

        const formattedOffset = `${sign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;

        return {
          ...tz,
          offset: formattedOffset
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error calculating offset for ${tz.value}:`, errorMessage);
        return {
          ...tz,
          offset: "+00:00" 
        };
      }
    });

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