import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

const execAsync = promisify(exec);
const upload = multer({ storage: multer.memoryStorage() });

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

      // Mock people counting for each frame
      // TODO: Replace with actual AI people counting (Dify or other service)
      const frameCounts = frames.map(() => Math.floor(Math.random() * 5) + 1);
      
      // Use the maximum count as detected people count
      const detectedCount = frameCounts.length > 0 ? Math.max(...frameCounts) : 0;

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

  const httpServer = createServer(app);

  return httpServer;
}
