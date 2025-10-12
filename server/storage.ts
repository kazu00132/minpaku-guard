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

// Alert type for in-memory storage
export interface AlertData {
  id: number;
  bookingId: number;
  guestName: string;
  roomName: string;
  detectedAt: string;
  reservedCount: number;
  actualCount: number;
  status: "open" | "acknowledged" | "resolved";
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
  
  // Alert methods
  getAlerts(): Promise<AlertData[]>;
  getAlert(id: number): Promise<AlertData | undefined>;
  createAlert(data: Omit<AlertData, 'id'>): Promise<AlertData>;
  updateAlertStatus(id: number, status: "open" | "acknowledged" | "resolved"): Promise<AlertData | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bookings: Map<number, BookingData>;
  private alerts: Map<number, AlertData>;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.alerts = new Map();
    
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
    
    // Initialize with mock alerts
    this.alerts.set(1, {
      id: 1,
      bookingId: 1,
      guestName: "山田 太郎",
      roomName: "漁師の家",
      detectedAt: "2025-10-20T18:30:00Z",
      reservedCount: 4,
      actualCount: 6,
      status: "open"
    });
    this.alerts.set(2, {
      id: 2,
      bookingId: 3,
      guestName: "鈴木 一郎",
      roomName: "長屋 C",
      detectedAt: "2025-10-19T20:15:00Z",
      reservedCount: 2,
      actualCount: 3,
      status: "acknowledged"
    });
    this.alerts.set(3, {
      id: 3,
      bookingId: 5,
      guestName: "高橋 美咲",
      roomName: "長屋 B",
      detectedAt: "2025-10-18T19:00:00Z",
      reservedCount: 3,
      actualCount: 4,
      status: "resolved"
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

  async getAlerts(): Promise<AlertData[]> {
    return Array.from(this.alerts.values());
  }

  async getAlert(id: number): Promise<AlertData | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(data: Omit<AlertData, 'id'>): Promise<AlertData> {
    const id = Math.max(...Array.from(this.alerts.keys()), 0) + 1;
    const alert: AlertData = { ...data, id };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlertStatus(id: number, status: "open" | "acknowledged" | "resolved"): Promise<AlertData | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) {
      return undefined;
    }
    
    const updated = { ...alert, status };
    this.alerts.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
