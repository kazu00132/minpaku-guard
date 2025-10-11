import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

const upload = multer({ 
  storage: multer.diskStorage({
    destination: "/tmp",
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
      cb(null, `upload_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  })
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

  const httpServer = createServer(app);

  return httpServer;
}
