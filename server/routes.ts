import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";

const upload = multer({ storage: multer.memoryStorage() });

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

  const httpServer = createServer(app);

  return httpServer;
}
