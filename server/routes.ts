import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { z } from "zod";

const execAsync = promisify(exec);
const upload = multer({ storage: multer.memoryStorage() });

// OpenAI Vision API: Count people in an image
async function countPeopleInFrame(base64Image: string): Promise<number> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.warn("OPENAI_API_KEY not found, using mock count");
    return Math.floor(Math.random() * 5) + 1;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "この画像に写っている人の数を数えてください。数字だけを答えてください。人が一人もいない場合は0と答えてください。"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      // Fallback to mock on error
      return Math.floor(Math.random() * 5) + 1;
    }

    const data = await response.json();
    const countText = data.choices[0]?.message?.content?.trim() || "0";
    const count = parseInt(countText, 10);

    // Validate the count is a valid number
    if (isNaN(count) || count < 0) {
      console.warn("Invalid count from OpenAI:", countText);
      return Math.floor(Math.random() * 5) + 1;
    }

    return count;
  } catch (error) {
    console.error("Error calling OpenAI Vision API:", error);
    // Fallback to mock on error
    return Math.floor(Math.random() * 5) + 1;
  }
}

// Video processing utility: Extract frames every 5 seconds
async function extractFramesFromVideo(videoBuffer: Buffer): Promise<string[]> {
  const tempDir = path.join(process.cwd(), "temp");
  const timestamp = Date.now();
  const videoPath = path.join(tempDir, `video_${timestamp}.mp4`);
  const framePrefix = `frame_${timestamp}`;
  const outputPattern = path.join(tempDir, `${framePrefix}_%03d.jpg`);

  try {
    // Create temp directory if not exists
    if (!existsSync(tempDir)) {
      await fs.mkdir(tempDir, { recursive: true });
    }

    // Save video buffer to file
    await fs.writeFile(videoPath, videoBuffer);

    // Extract frames every 5 seconds using ffmpeg
    await execAsync(
      `ffmpeg -i "${videoPath}" -vf "fps=1/5" "${outputPattern}"`
    );

    // Get all generated frame files
    const files = await fs.readdir(tempDir);
    const frameFiles = files
      .filter(f => f.startsWith(framePrefix) && f.endsWith('.jpg'))
      .map(f => path.join(tempDir, f));

    // Check if frames were extracted
    if (frameFiles.length === 0) {
      console.error("No frames extracted from video");
      throw new Error("動画からフレームを抽出できませんでした");
    }

    // Read frames as base64
    const frames: string[] = [];
    for (const framePath of frameFiles) {
      const frameBuffer = await fs.readFile(framePath);
      frames.push(frameBuffer.toString('base64'));
    }

    // Cleanup
    await fs.unlink(videoPath);
    for (const framePath of frameFiles) {
      await fs.unlink(framePath);
    }

    return frames;
  } catch (error) {
    console.error("Frame extraction error:", error);
    // Cleanup on error
    try {
      if (existsSync(videoPath)) await fs.unlink(videoPath);
      // Cleanup any partial frames
      const files = await fs.readdir(tempDir);
      const partialFrames = files
        .filter(f => f.startsWith(framePrefix) && f.endsWith('.jpg'))
        .map(f => path.join(tempDir, f));
      for (const framePath of partialFrames) {
        await fs.unlink(framePath);
      }
    } catch {}
    throw error;
  }
}

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

  // Demo: Process video - extract frames and count people
  app.post("/api/demo/process-video", upload.single("video"), async (req, res) => {
    try {
      const { reservedCount } = req.body;
      const video = req.file;

      if (!video) {
        return res.status(400).json({ error: "動画ファイルが必要です" });
      }

      if (!reservedCount) {
        return res.status(400).json({ error: "予約人数が必要です" });
      }

      const reserved = parseInt(reservedCount, 10);

      // Extract frames from video
      const frames = await extractFramesFromVideo(video.buffer);

      if (frames.length === 0) {
        return res.status(400).json({ error: "動画からフレームを抽出できませんでした" });
      }

      // Count people in each frame using OpenAI Vision API
      console.log(`Processing ${frames.length} frames with OpenAI Vision API...`);
      const frameCounts: number[] = [];
      
      for (const frame of frames) {
        const count = await countPeopleInFrame(frame);
        frameCounts.push(count);
        console.log(`Frame ${frameCounts.length}: ${count} people detected`);
      }
      
      // Use the maximum count as detected people count
      const detectedCount = frameCounts.length > 0 ? Math.max(...frameCounts) : 0;
      console.log(`Maximum detected count: ${detectedCount}`);

      // Compare with reserved count
      const status = detectedCount > reserved ? "error" : "normal";
      const message = detectedCount > reserved
        ? `警告: 予約人数(${reserved}人)より多い${detectedCount}人を検出しました`
        : `正常: 検出人数(${detectedCount}人)は予約人数(${reserved}人)以内です`;

      res.json({
        success: true,
        reservedCount: reserved,
        detectedCount,
        frameCount: frames.length,
        frameCounts,
        status,
        message,
        frames: frames.map((f, i) => ({ 
          index: i + 1, 
          peopleCount: frameCounts[i],
          image: `data:image/jpeg;base64,${f}`
        }))
      });
    } catch (error) {
      console.error("Video processing error:", error);
      res.status(500).json({ error: "動画処理に失敗しました" });
    }
  });

  // Demo: Send results to Dify
  app.post("/api/demo/send-to-dify", async (req, res) => {
    try {
      const { reservedCount, detectedCount, frames } = req.body;

      if (!reservedCount || !detectedCount || !frames) {
        return res.status(400).json({ error: "必要なパラメータが不足しています" });
      }

      const difyApiKey = process.env.DIFY_API_KEY;
      if (!difyApiKey) {
        return res.status(500).json({ error: "DIFY_API_KEYが設定されていません" });
      }

      // Call Dify API
      const difyUrl = "http://dify.tamao.tech/v1/workflows/run";
      
      const difyResponse = await fetch(difyUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${difyApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            reserved_count: reservedCount,
            detected_count: detectedCount,
            frame_data: frames,
          },
          response_mode: "blocking",
          user: "minpaku-guard-system"
        })
      });

      if (!difyResponse.ok) {
        const errorText = await difyResponse.text();
        console.error("Dify API error:", errorText);
        return res.status(500).json({ 
          error: "Dify API呼び出しに失敗しました",
          details: errorText
        });
      }

      const difyResult = await difyResponse.json();

      res.json({
        success: true,
        difyResponse: difyResult,
        message: "Difyワークフローに送信しました"
      });
    } catch (error) {
      console.error("Dify send error:", error);
      res.status(500).json({ 
        error: "Difyへの送信に失敗しました",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Bookings API
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ error: "予約一覧の取得に失敗しました" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ error: "予約が見つかりません" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ error: "予約の取得に失敗しました" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Validate request body
      const updateSchema = z.object({
        guestName: z.string().min(1).optional(),
        reservedAt: z.string().datetime().optional(),
        reservedCount: z.number().int().min(1).max(20).optional(),
        actualCount: z.number().int().min(0).max(20).nullable().optional(),
        status: z.enum(["booked", "checked_in", "checked_out"]).optional(),
        roomName: z.string().min(1).optional(),
      });
      
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "無効なデータです",
          details: validationResult.error.errors 
        });
      }
      
      const updated = await storage.updateBooking(id, validationResult.data);
      
      if (!updated) {
        return res.status(404).json({ error: "予約が見つかりません" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Update booking error:", error);
      res.status(500).json({ error: "予約の更新に失敗しました" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
