import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  sourceTimezone: text("source_timezone").notNull(),
  targetTimezone: text("target_timezone").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  sourceTimezone: true,
  targetTimezone: true,
  name: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export const conversions = pgTable("conversions", {
  id: serial("id").primaryKey(),
  sourceTimezone: text("source_timezone").notNull(),
  targetTimezone: text("target_timezone").notNull(),
  sourceTime: text("source_time").notNull(),
  targetTime: text("target_time").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConversionSchema = createInsertSchema(conversions).pick({
  sourceTimezone: true,
  targetTimezone: true,
  sourceTime: true,
  targetTime: true,
  date: true,
});

export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type Conversion = typeof conversions.$inferSelect;
