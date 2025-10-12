import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { insertBookingSchema, insertGuestSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({ 
  storage: multer.diskStorage({
    destination: "/tmp",
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
      cb(null, `upload_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow images for face verification and videos for processing
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo: Face verification endpoint
  app.post("/api/demo/verify", upload.single("photo"), async (req, res) => {
    try {
      const { guestId } = req.body;
      const photo = req.file;

      if (!photo || !guestId) {
        return res.status(400).json({ error: "写真とゲストIDが必要です" });
      }

      // Mock guest data
      const mockGuests: Record<string, string> = {
        "1": "田中太郎",
        "2": "佐藤花子",
        "3": "山田次郎",
      };

      const guestName = mockGuests[guestId] || "不明なゲスト";

      // Mock Face API response
      // TODO: Replace with actual Azure Face API or AWS Rekognition
      const confidence = Math.random() * 0.4 + 0.6; // 60-100%
      const isMatch = confidence > 0.8; // 80% threshold

      res.json({
        isMatch,
        confidence,
        guestName,
      });
    } catch (error) {
      console.error("Face verification error:", error);
      res.status(500).json({ error: "顔照合に失敗しました" });
    }
  });

  // Demo: Trigger Dify workflow endpoint
  app.post("/api/demo/trigger-dify", async (req, res) => {
    try {
      const { guestId, confidence, isMatch } = req.body;

      if (!guestId || confidence === undefined || isMatch === undefined) {
        return res.status(400).json({ error: "必要なパラメータが不足しています" });
      }

      // Mock Dify workflow trigger
      // TODO: Replace with actual Dify API call
      const workflowId = `workflow_${Date.now()}`;
      
      // In production, you would call Dify's API here:
      // const difyResponse = await fetch(process.env.DIFY_WEBHOOK_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     guest_id: guestId,
      //     face_confidence: confidence,
      //     is_verified: isMatch
      //   })
      // });

      res.json({
        success: true,
        workflowId,
        message: `Difyワークフロー ${workflowId} を起動しました（モック）`,
      });
    } catch (error) {
      console.error("Dify workflow trigger error:", error);
      res.status(500).json({ error: "Difyワークフロー起動に失敗しました" });
    }
  });

  // Demo: Process video and extract frames
  app.post("/api/demo/process-video", upload.single("video"), async (req, res) => {
    const tempDir = path.join("/tmp", `video_${Date.now()}`);
    let uploadedVideoPath: string | undefined;
    
    try {
      const { bookingId } = req.body;
      const video = req.file;

      if (!video || !bookingId) {
        return res.status(400).json({ error: "動画と予約IDが必要です" });
      }

      uploadedVideoPath = video.path;

      // Mock booking data
      const mockBookings: Record<string, { guestName: string; roomName: string; reservedCount: number }> = {
        "1": { guestName: "田中太郎", roomName: "民家", reservedCount: 4 },
        "2": { guestName: "佐藤花子", roomName: "長屋", reservedCount: 2 },
      };

      const booking = mockBookings[bookingId];
      if (!booking) {
        return res.status(404).json({ error: "予約が見つかりません" });
      }

      // Create temp directory for frames
      await fs.mkdir(tempDir, { recursive: true });

      // Extract frames every 10 seconds using ffmpeg with spawn to avoid buffer overflow
      const framesPattern = path.join(tempDir, "frame_%03d.jpg");
      
      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
          "-i", video.path,
          "-vf", "fps=1/10",
          framesPattern
        ]);

        let stderr = "";
        
        ffmpeg.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        ffmpeg.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`ffmpeg failed with code ${code}: ${stderr}`));
          }
        });

        ffmpeg.on("error", (err) => {
          reject(err);
        });
      });

      // Get list of extracted frames
      const files = await fs.readdir(tempDir);
      const frameFiles = files.filter(f => f.startsWith("frame_")).sort();

      // Process each frame
      const results = [];
      for (let i = 0; i < frameFiles.length; i++) {
        const timestamp = `${i * 10}秒`;
        
        // Mock person detection
        // TODO: Replace with actual Dify API call
        // In production, send each frame to Dify:
        // const frameBuffer = await fs.readFile(path.join(tempDir, frameFiles[i]));
        // const difyResponse = await fetch(process.env.DIFY_VISION_URL, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     image: frameBuffer.toString('base64'),
        //     reserved_count: booking.reservedCount
        //   })
        // });

        // Mock detected count (randomize between reserved -1 to +2)
        const variance = Math.floor(Math.random() * 4) - 1;
        const detectedCount = Math.max(0, booking.reservedCount + variance);
        const confidence = Math.random() * 0.2 + 0.8; // 80-100%
        const hasDiscrepancy = detectedCount !== booking.reservedCount;

        results.push({
          timestamp,
          detectedCount,
          hasDiscrepancy,
          confidence,
        });
      }

      // Clean up temp directory and uploaded video
      await fs.rm(tempDir, { recursive: true, force: true });
      if (uploadedVideoPath) {
        await fs.unlink(uploadedVideoPath);
      }

      res.json({
        success: true,
        results,
        bookingName: `${booking.guestName} - ${booking.roomName}`,
        reservedCount: booking.reservedCount,
      });
    } catch (error) {
      console.error("Video processing error:", error);
      // Clean up on error
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        if (uploadedVideoPath) {
          await fs.unlink(uploadedVideoPath);
        }
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
      res.status(500).json({ error: "動画処理に失敗しました" });
    }
  });

  // Booking Management APIs
  
  // Get all rooms
  app.get("/api/rooms", async (_req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Get rooms error:", error);
      res.status(500).json({ error: "部屋一覧の取得に失敗しました" });
    }
  });

  // Get all bookings with guest and room details
  app.get("/api/bookings", async (_req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      
      // Enrich bookings with guest, room, and entry events details
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const guest = await storage.getGuest(booking.guestId);
          const room = await storage.getRoom(booking.roomId);
          const entryEvents = await storage.getEntryEventsByBooking(booking.id);
          
          return {
            id: booking.id,
            reservedAt: booking.reservedAt,
            reservedCount: booking.reservedCount,
            status: booking.status,
            guest: guest ? {
              id: guest.id,
              fullName: guest.fullName,
              faceImageUrl: guest.faceImageUrl,
            } : null,
            room: room ? {
              id: room.id,
              name: room.name,
            } : null,
            entryEvents: entryEvents || [],
          };
        })
      );

      res.json(enrichedBookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ error: "予約一覧の取得に失敗しました" });
    }
  });

  // Create booking with guest
  app.post("/api/bookings", async (req, res) => {
    try {
      // Define combined schema for booking creation
      const createBookingSchema = z.object({
        guestName: z.string().min(1, "氏名を入力してください"),
        roomId: z.string().min(1, "部屋を選択してください"),
        reservedAt: z.string().datetime(),
        reservedCount: z.number().int().positive("予約人数は1以上を入力してください"),
      });

      const validated = createBookingSchema.parse(req.body);

      // Create guest data
      const guestData = {
        fullName: validated.guestName,
        age: null,
        licenseImageUrl: null,
        faceImageUrl: null,
        phone: null,
        email: null,
      };

      // Create booking data
      const bookingData = {
        roomId: validated.roomId,
        reservedAt: new Date(validated.reservedAt),
        reservedCount: validated.reservedCount,
        status: "booked",
      };

      const result = await storage.createBookingWithGuest(guestData, bookingData);

      // Return enriched booking
      const room = await storage.getRoom(result.booking.roomId);
      res.status(201).json({
        ...result.booking,
        guestName: result.guest.fullName,
        roomName: room?.name || "不明",
        faceImageUrl: result.guest.faceImageUrl,
      });
    } catch (error) {
      console.error("Create booking error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "予約の作成に失敗しました" });
    }
  });

  // Update booking
  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Define update schema
      const updateBookingSchema = z.object({
        guestName: z.string().min(1).optional(),
        reservedAt: z.string().datetime().optional(),
        reservedCount: z.number().int().positive().optional(),
        roomId: z.string().optional(),
        status: z.enum(["booked", "checked_in", "checked_out", "canceled"]).optional(),
      }).refine(
        (data) => Object.keys(data).length > 0,
        { message: "更新する項目を少なくとも1つ指定してください" }
      );

      const validated = updateBookingSchema.parse(req.body);

      // Get existing booking to update guest if needed
      const existingBooking = await storage.getBooking(id);
      if (!existingBooking) {
        return res.status(404).json({ error: "予約が見つかりません" });
      }

      // Update guest name if provided
      if (validated.guestName) {
        const updatedGuest = await storage.updateGuest(existingBooking.guestId, {
          fullName: validated.guestName,
        });
        if (!updatedGuest) {
          return res.status(404).json({ error: "ゲスト情報が見つかりません" });
        }
      }

      // Prepare booking updates
      const bookingUpdates: any = {};
      if (validated.reservedAt) bookingUpdates.reservedAt = new Date(validated.reservedAt);
      if (validated.reservedCount !== undefined) bookingUpdates.reservedCount = validated.reservedCount;
      if (validated.roomId) bookingUpdates.roomId = validated.roomId;
      if (validated.status) bookingUpdates.status = validated.status;

      const updatedBooking = await storage.updateBooking(id, bookingUpdates);
      if (!updatedBooking) {
        return res.status(404).json({ error: "予約が見つかりません" });
      }

      // Return enriched booking
      const guest = await storage.getGuest(updatedBooking.guestId);
      const room = await storage.getRoom(updatedBooking.roomId);

      res.json({
        ...updatedBooking,
        guestName: guest?.fullName || "不明",
        roomName: room?.name || "不明",
        faceImageUrl: guest?.faceImageUrl || null,
      });
    } catch (error) {
      console.error("Update booking error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "予約の更新に失敗しました" });
    }
  });

  // Delete booking
  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBooking(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "予約が見つかりません" });
      }

      res.json({ success: true, message: "予約を削除しました" });
    } catch (error) {
      console.error("Delete booking error:", error);
      res.status(500).json({ error: "予約の削除に失敗しました" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
