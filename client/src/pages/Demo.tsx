import { useState } from "react";
import { Camera, Upload, CheckCircle, AlertCircle, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface VideoProcessResult {
  timestamp: string;
  detectedCount: number;
  hasDiscrepancy: boolean;
  confidence: number;
  description?: string;
}

interface DifyResult {
  workflowRunId: string;
  status: string;
  outputs: any;
  error?: string;
}

interface VideoProcessResponse {
  success: boolean;
  results: VideoProcessResult[];
  bookingName: string;
  reservedCount: number;
  difyResult?: DifyResult | null;
}

export default function Demo() {
  // Photo verification states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedGuest, setSelectedGuest] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  // Video processing states
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<string>("");
  const [videoProcessResult, setVideoProcessResult] = useState<VideoProcessResponse | null>(null);
  
  const { toast } = useToast();

  const mockGuests = [
    { id: "1", name: "田中太郎", faceImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka" },
    { id: "2", name: "佐藤花子", faceImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sato" },
    { id: "3", name: "山田次郎", faceImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=yamada" },
  ];

  const mockBookings = [
    { id: "1", guestName: "田中太郎", reservedCount: 4, roomName: "民家" },
    { id: "2", guestName: "佐藤花子", reservedCount: 2, roomName: "長屋" },
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

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedVideo(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      setVideoProcessResult(null);
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

      const data = await response.json();
      return data as VerificationResult;
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

  const processVideoMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVideo || !selectedBooking) {
        throw new Error("動画と予約を選択してください");
      }

      const formData = new FormData();
      formData.append("video", selectedVideo);
      formData.append("bookingId", selectedBooking);

      const response = await fetch("/api/demo/process-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("動画処理に失敗しました");
      }

      const data = await response.json();
      return data as VideoProcessResponse;
    },
    onSuccess: (data: VideoProcessResponse) => {
      setVideoProcessResult(data);
      const hasDiscrepancy = data.results.some(r => r.hasDiscrepancy);
      toast({
        title: hasDiscrepancy ? "差分検知" : "処理完了",
        description: hasDiscrepancy 
          ? "予約人数と実際の人数に差異が見つかりました" 
          : "動画処理が完了しました",
        variant: hasDiscrepancy ? "destructive" : "default",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">デモ - 顔認証・動画人数カウント</h1>
        <p className="text-muted-foreground mt-2">
          スマホから写真や動画をアップロードして、顔照合や人数カウントをテストします
        </p>
      </div>

      <Tabs defaultValue="photo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photo" data-testid="tab-photo">
            <Camera className="mr-2 h-4 w-4" />
            顔認証テスト
          </TabsTrigger>
          <TabsTrigger value="video" data-testid="tab-video">
            <Video className="mr-2 h-4 w-4" />
            動画人数カウント
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photo" className="mt-6">
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
        </TabsContent>

        <TabsContent value="video" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>動画アップロード</CardTitle>
                <CardDescription>動画から10秒ごとに人数をカウントします</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-upload">動画を選択</Label>
                  <div className="flex gap-2">
                    <input
                      id="video-camera"
                      type="file"
                      accept="video/*"
                      capture="environment"
                      onChange={handleVideoChange}
                      className="hidden"
                      data-testid="input-video-camera"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("video-camera")?.click()}
                      className="flex-1"
                      data-testid="button-video-camera"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      動画撮影
                    </Button>
                    <input
                      id="video-gallery"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                      data-testid="input-video-gallery"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("video-gallery")?.click()}
                      className="flex-1"
                      data-testid="button-video-gallery"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      ギャラリー
                    </Button>
                  </div>
                </div>

                {videoPreviewUrl && (
                  <div className="space-y-2">
                    <Label>プレビュー</Label>
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full h-64 rounded-lg border"
                      data-testid="video-preview"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="booking-select">予約を選択</Label>
                  <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                    <SelectTrigger id="booking-select" data-testid="select-booking">
                      <SelectValue placeholder="予約を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBookings.map((booking) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          {booking.guestName} - {booking.roomName} ({booking.reservedCount}名)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => processVideoMutation.mutate()}
                  disabled={!selectedVideo || !selectedBooking || processVideoMutation.isPending}
                  className="w-full"
                  data-testid="button-process-video"
                >
                  {processVideoMutation.isPending ? "処理中..." : "動画を処理"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>人数カウント結果</CardTitle>
                <CardDescription>10秒ごとの人数判定結果を表示します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {videoProcessResult ? (
                  <>
                    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                      <Users className="h-12 w-12 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold text-lg">
                          {videoProcessResult.bookingName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          予約人数: {videoProcessResult.reservedCount}名
                        </p>
                      </div>
                    </div>

                    {videoProcessResult.difyResult && (
                      <div className="p-4 rounded-lg border bg-card space-y-2">
                        <h3 className="font-semibold">Difyワークフロー結果</h3>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ワークフローID:</span>
                            <span className="font-mono text-xs">{videoProcessResult.difyResult.workflowRunId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ステータス:</span>
                            <span>{videoProcessResult.difyResult.status}</span>
                          </div>
                          {videoProcessResult.difyResult.outputs && (
                            <div className="mt-2">
                              <span className="text-muted-foreground">出力:</span>
                              <pre className="bg-secondary p-2 rounded mt-1 text-xs overflow-auto max-h-32">
                                {JSON.stringify(videoProcessResult.difyResult.outputs, null, 2)}
                              </pre>
                            </div>
                          )}
                          {videoProcessResult.difyResult.error && (
                            <div className="text-destructive text-sm mt-2">
                              エラー: {videoProcessResult.difyResult.error}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {videoProcessResult.results.map((result, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            result.hasDiscrepancy ? "bg-destructive/10 border-destructive" : "bg-card"
                          }`}
                          data-testid={`result-${index}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{result.timestamp}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                検出: {result.detectedCount}名
                              </span>
                              {result.hasDiscrepancy && (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            信頼度: {(result.confidence * 100).toFixed(1)}%
                          </div>
                          {result.description && (
                            <div className="text-xs text-muted-foreground mt-2">
                              {result.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>動画をアップロードして処理を実行してください</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>API仕様</CardTitle>
          <CardDescription>実装されているAPIエンドポイント</CardDescription>
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
            <h3 className="font-semibold">2. 動画人数カウントAPI</h3>
            <pre className="bg-secondary p-4 rounded-lg text-xs overflow-x-auto">
{`POST /api/demo/process-video
Content-Type: multipart/form-data

FormData:
  - video: File (動画ファイル)
  - bookingId: string (予約ID)

Response:
{
  "success": boolean,
  "results": [
    {
      "timestamp": string,
      "detectedCount": number,
      "hasDiscrepancy": boolean,
      "confidence": number
    }
  ],
  "bookingName": string,
  "reservedCount": number
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
