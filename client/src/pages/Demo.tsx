import { useState } from "react";
import { Camera, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface VerificationResult {
  isMatch: boolean;
  confidence: number;
  guestName: string;
}

interface DifyResponse {
  success: boolean;
  workflowId: string;
  message: string;
}

export default function Demo() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedGuest, setSelectedGuest] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const mockGuests = [
    { id: "1", name: "田中太郎", faceImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka" },
    { id: "2", name: "佐藤花子", faceImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sato" },
    { id: "3", name: "山田次郎", faceImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=yamada" },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setVerificationResult(null);
    }
  };

  const verifyFaceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !selectedGuest) {
        throw new Error("写真とゲストを選択してください");
      }

      const formData = new FormData();
      formData.append("photo", selectedFile);
      formData.append("guestId", selectedGuest);

      const response = await fetch("/api/demo/verify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("顔照合に失敗しました");
      }

      return response.json();
    },
    onSuccess: (data: VerificationResult) => {
      setVerificationResult(data);
      toast({
        title: data.isMatch ? "照合成功" : "照合失敗",
        description: `信頼度: ${(data.confidence * 100).toFixed(1)}%`,
        variant: data.isMatch ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const triggerDifyMutation = useMutation({
    mutationFn: async () => {
      if (!verificationResult) {
        throw new Error("先に顔照合を実行してください");
      }

      const response = await apiRequest(
        "POST",
        "/api/demo/trigger-dify",
        {
          guestId: selectedGuest,
          confidence: verificationResult.confidence,
          isMatch: verificationResult.isMatch,
        }
      );

      return response.json() as Promise<DifyResponse>;
    },
    onSuccess: (data: DifyResponse) => {
      toast({
        title: "Difyワークフロー起動成功",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Difyワークフロー起動失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">デモ - 顔認証テスト</h1>
        <p className="text-muted-foreground mt-2">
          スマホから写真をアップロードして、登録済みゲストとの顔照合をテストします
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>写真アップロード</CardTitle>
            <CardDescription>カメラで撮影するか、ギャラリーから選択してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo-upload">写真を選択</Label>
              <div className="flex gap-2">
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-photo-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("photo-upload")?.click()}
                  className="flex-1"
                  data-testid="button-camera"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  カメラ撮影
                </Button>
                <input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-gallery-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("gallery-upload")?.click()}
                  className="flex-1"
                  data-testid="button-gallery"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  ギャラリー
                </Button>
              </div>
            </div>

            {previewUrl && (
              <div className="space-y-2">
                <Label>プレビュー</Label>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border"
                  data-testid="img-preview"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="guest-select">照合するゲストを選択</Label>
              <Select value={selectedGuest} onValueChange={setSelectedGuest}>
                <SelectTrigger id="guest-select" data-testid="select-guest">
                  <SelectValue placeholder="ゲストを選択" />
                </SelectTrigger>
                <SelectContent>
                  {mockGuests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => verifyFaceMutation.mutate()}
              disabled={!selectedFile || !selectedGuest || verifyFaceMutation.isPending}
              className="w-full"
              data-testid="button-verify"
            >
              {verifyFaceMutation.isPending ? "照合中..." : "顔照合を実行"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>照合結果</CardTitle>
            <CardDescription>Face APIによる顔照合の結果を表示します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationResult ? (
              <>
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  {verificationResult.isMatch ? (
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  ) : (
                    <AlertCircle className="h-12 w-12 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-lg" data-testid="text-result-status">
                      {verificationResult.isMatch ? "照合成功" : "照合失敗"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {verificationResult.guestName}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">信頼度</span>
                    <span className="font-semibold" data-testid="text-confidence">
                      {(verificationResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${verificationResult.confidence * 100}%` }}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => triggerDifyMutation.mutate()}
                  disabled={triggerDifyMutation.isPending}
                  className="w-full"
                  variant="default"
                  data-testid="button-trigger-dify"
                >
                  {triggerDifyMutation.isPending ? "起動中..." : "Difyワークフロー起動"}
                </Button>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>写真をアップロードして顔照合を実行してください</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API仕様</CardTitle>
          <CardDescription>Face APIとDifyワークフロー連携の仕様</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. 顔照合API</h3>
            <pre className="bg-secondary p-4 rounded-lg text-xs overflow-x-auto">
{`POST /api/demo/verify
Content-Type: multipart/form-data

FormData:
  - photo: File (画像ファイル)
  - guestId: string (ゲストID)

Response:
{
  "isMatch": boolean,
  "confidence": number (0-1),
  "guestName": string
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Difyワークフロー起動API</h3>
            <pre className="bg-secondary p-4 rounded-lg text-xs overflow-x-auto">
{`POST /api/demo/trigger-dify
Content-Type: application/json

Body:
{
  "guestId": string,
  "confidence": number,
  "isMatch": boolean
}

Response:
{
  "success": boolean,
  "workflowId": string,
  "message": string
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
