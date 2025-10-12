import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// Temporary booking type for in-memory storage
export interface BookingData {
  id: number;
  guestName: string;
  reservedAt: string;
  reservedCount: number;
  actualCount: number | null;
  status: "booked" | "checked_in" | "checked_out";
  roomName: string;
  faceImageUrl?: string | null;
}

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Booking methods
  getBookings(): Promise<BookingData[]>;
  getBooking(id: number): Promise<BookingData | undefined>;
  updateBooking(id: number, data: Partial<Omit<BookingData, 'id'>>): Promise<BookingData | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bookings: Map<number, BookingData>;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    
    // Initialize with mock bookings
    this.bookings.set(1, {
      id: 1,
      guestName: "田中太郎",
      reservedAt: "2024-10-15T14:00:00Z",
      reservedCount: 4,
      actualCount: 6,
      status: "checked_in",
      roomName: "漁師町の民家",
      faceImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanaka"
    });
    this.bookings.set(2, {
      id: 2,
      guestName: "佐藤花子",
      reservedAt: "2024-10-16T15:00:00Z",
      reservedCount: 2,
      actualCount: null,
      status: "booked",
      roomName: "長屋1号室",
      faceImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sato"
    });
    this.bookings.set(3, {
      id: 3,
      guestName: "山田次郎",
      reservedAt: "2024-10-17T16:00:00Z",
      reservedCount: 3,
      actualCount: 3,
      status: "checked_in",
      roomName: "漁師町の民家",
      faceImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yamada"
    });
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

  async getBookings(): Promise<BookingData[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: number): Promise<BookingData | undefined> {
    return this.bookings.get(id);
  }

  async updateBooking(id: number, data: Partial<Omit<BookingData, 'id'>>): Promise<BookingData | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) {
      return undefined;
    }
    
    const updated = { ...booking, ...data };
    this.bookings.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
