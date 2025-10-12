import { type User, type InsertUser, type Guest, type InsertGuest, type Room, type InsertRoom, type Booking, type InsertBooking } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Guests
  getGuest(id: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;

  // Rooms
  getRoom(id: string): Promise<Room | undefined>;
  getAllRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;

  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;

  // Combined operation for creating booking with guest
  createBookingWithGuest(guestData: Omit<InsertGuest, 'id'>, bookingData: Omit<InsertBooking, 'guestId'>): Promise<{ booking: Booking; guest: Guest }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private guests: Map<string, Guest>;
  private rooms: Map<string, Room>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.users = new Map();
    this.guests = new Map();
    this.rooms = new Map();
    this.bookings = new Map();

    // Initialize with sample rooms
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const room1: Room = {
      id: randomUUID(),
      name: "漁師の家",
      address: "富山市漁師町",
      notes: "メインの民家"
    };
    const room2: Room = {
      id: randomUUID(),
      name: "長屋 A",
      address: "富山市漁師町長屋1",
      notes: "6世帯のうち1戸"
    };
    const room3: Room = {
      id: randomUUID(),
      name: "長屋 B",
      address: "富山市漁師町長屋2",
      notes: null
    };

    this.rooms.set(room1.id, room1);
    this.rooms.set(room2.id, room2);
    this.rooms.set(room3.id, room3);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Guest operations
  async getGuest(id: string): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = randomUUID();
    const guest: Guest = { 
      id,
      fullName: insertGuest.fullName,
      age: insertGuest.age ?? null,
      licenseImageUrl: insertGuest.licenseImageUrl ?? null,
      faceImageUrl: insertGuest.faceImageUrl ?? null,
      phone: insertGuest.phone ?? null,
      email: insertGuest.email ?? null,
    };
    this.guests.set(id, guest);
    return guest;
  }

  // Room operations
  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const room: Room = { 
      id,
      name: insertRoom.name,
      address: insertRoom.address ?? null,
      notes: insertRoom.notes ?? null,
    };
    this.rooms.set(id, room);
    return room;
  }

  // Booking operations
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    // Verify guest exists
    const guest = await this.getGuest(insertBooking.guestId);
    if (!guest) {
      throw new Error(`Guest with id ${insertBooking.guestId} not found`);
    }

    // Verify room exists
    const room = await this.getRoom(insertBooking.roomId);
    if (!room) {
      throw new Error(`Room with id ${insertBooking.roomId} not found`);
    }

    const id = randomUUID();
    const booking: Booking = { 
      id,
      guestId: insertBooking.guestId,
      roomId: insertBooking.roomId,
      reservedAt: insertBooking.reservedAt,
      reservedCount: insertBooking.reservedCount,
      status: insertBooking.status ?? "booked",
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const existing = this.bookings.get(id);
    if (!existing) return undefined;

    // Verify room exists if roomId is being updated
    if (updates.roomId && updates.roomId !== existing.roomId) {
      const room = await this.getRoom(updates.roomId);
      if (!room) {
        throw new Error(`Room with id ${updates.roomId} not found`);
      }
    }

    // Verify guest exists if guestId is being updated
    if (updates.guestId && updates.guestId !== existing.guestId) {
      const guest = await this.getGuest(updates.guestId);
      if (!guest) {
        throw new Error(`Guest with id ${updates.guestId} not found`);
      }
    }

    const updated: Booking = { 
      ...existing, 
      ...updates,
      status: updates.status ?? existing.status,
    };
    this.bookings.set(id, updated);
    return updated;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const exists = this.bookings.has(id);
    if (!exists) return false;
    return this.bookings.delete(id);
  }

  async createBookingWithGuest(
    guestData: InsertGuest, 
    bookingData: Omit<InsertBooking, 'guestId'>
  ): Promise<{ booking: Booking; guest: Guest }> {
    // Verify room exists before any mutations
    const room = await this.getRoom(bookingData.roomId);
    if (!room) {
      throw new Error(`Room with id ${bookingData.roomId} not found`);
    }

    let guest: Guest | undefined;
    try {
      guest = await this.createGuest(guestData);
      const booking = await this.createBooking({
        ...bookingData,
        guestId: guest.id,
      });

      return { booking, guest };
    } catch (error) {
      // Rollback: remove guest if booking creation failed
      if (guest) {
        this.guests.delete(guest.id);
      }
      throw error;
    }
  }
}

export const storage = new MemStorage();
