import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Future schema for vacation rental management
// TODO: Implement these tables when migrating from in-memory storage to PostgreSQL

export const guests = pgTable("guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  age: integer("age"),
  licenseImageUrl: text("license_image_url"),
  faceImageUrl: text("face_image_url"), // 顔写真URL
  phone: text("phone"),
  email: text("email"),
});

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  notes: text("notes"),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guestId: varchar("guest_id").notNull().references(() => guests.id),
  roomId: varchar("room_id").notNull().references(() => rooms.id),
  reservedAt: timestamp("reserved_at").notNull(),
  reservedCount: integer("reserved_count").notNull(),
  status: text("status").notNull().default("booked"), // booked, checked_in, checked_out, canceled
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  reservedCount: integer("reserved_count").notNull(),
  actualCount: integer("actual_count").notNull(),
  status: text("status").notNull().default("open"), // open, resolved
});

export const insertGuestSchema = createInsertSchema(guests).omit({ id: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true });

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
