# Minpaku Guard - 民泊管理システム

## プロジェクト概要

富山の漁師町で民泊を運営する40代共働き夫婦のための、予約人数と実人数の差分を自動検知する管理ダッシュボード。

## 利用者

- **対象**: 富山市在住の40代共働き夫婦
- **物件**: 漁師町の民家 + 長屋（6世帯のうち1戸）
- **運用**: 富山市から車で30分の距離から遠隔管理

## 主要機能

### 1. 予約管理
- 宿泊者情報（氏名、年齢、免許証、顔写真、連絡先）
- 予約日時、予約人数、部屋情報
- ステータス管理（未入室・入室中・チェックアウト）

### 2. 入退室トラッキング
- カメラによる入退室検知
- 実人数の自動カウント
- 入退室イベントのタイムライン表示

### 3. 差分アラート
- 予約人数 vs 実人数の自動比較
- 差分検知時の自動アラート生成
- アラート状態管理（未対応・対応中・解決済）

### 4. 連絡機能
- 電話発信（Twilio統合予定）
- メール送信（SendGrid統合予定）
- 連絡履歴の記録

### 5. デバイス制御
- 玄関鍵の施錠・解錠（SwitchBot統合予定）
- ブレーカーのON/OFF（SwitchBot統合予定）
- 実行ログの記録

## 技術スタック

### フロントエンド
- React + TypeScript
- Vite
- Tailwind CSS + Shadcn UI
- Wouter（ルーティング）
- React Query（データフェッチング）

### バックエンド
- Express.js + TypeScript
- SQLite（開発環境）→ PostgreSQL（本番環境）
- In-memory storage（現在）

### デザイン
- **アクセントカラー**: 白えびピンク (#F6C6D0)
- **フォント**: Inter（本文）、JetBrains Mono（モノスペース）
- **ダークモード対応**: あり

## システム要件

### 予約制約
- **同時予約数**: 最大2件
  - システムは最大2件の同時予約を想定した設計
  - UIとデータ表示はこの制約を考慮

### 外部連携（予定）

#### 1. Dify（アラート通知）
- カメラ推論結果を受信
- 入退室イベントを `/api/webhooks/entry` に POST
- 差分検知時に自動アラート生成

#### 2. SwitchBot
- 鍵とブレーカーの遠隔制御
- デバイス状態の監視

#### 3. SendGrid / Twilio
- メール・SMS・電話による宿泊者連絡
- オーナーへのアラート通知

## API エンドポイント（計画）

### 予約関連
- `GET /api/bookings` - 予約一覧取得
- `POST /api/bookings` - 新規予約作成
- `GET /api/bookings/:id` - 予約詳細取得
- `PATCH /api/bookings/:id` - 予約更新

### Webhook
- `POST /api/webhooks/entry` - 入退室イベント受信（Difyから）

### アラート
- `GET /api/alerts` - アラート一覧取得
- `PATCH /api/alerts/:id` - アラート状態更新

### デバイス制御
- `POST /api/devices/:id/command` - デバイス操作

### 通知
- `POST /api/bookings/:id/notify` - 宿泊者への通知送信

## データモデル

### Guests（宿泊者）
- id, fullName, age, phone, email
- licenseImageUrl（免許証画像）
- faceImageUrl（顔写真）

### Rooms（部屋）
- id, name, address, notes

### Bookings（予約）
- id, guestId, roomId
- reservedAt, reservedCount
- status（booked/checked_in/checked_out）

### EntryEvents（入退室イベント）
- id, bookingId, timestamp
- eventType（enter/leave）
- peopleCount

### Alerts（アラート）
- id, bookingId, detectedAt
- reservedCount, actualCount
- status（open/acknowledged/resolved）

### Devices（デバイス）
- id, roomId, type（lock/breaker）
- name, externalId

## 開発状況

### 完成機能
- ✅ ダッシュボードUI
- ✅ 予約一覧表示（顔写真付き）
- ✅ アラート表示・管理
- ✅ デバイス制御UI（モック）
- ✅ 入退室タイムライン表示
- ✅ ダークモード対応
- ✅ レスポンシブデザイン

### 実装予定
- ⏳ PostgreSQLデータベース統合
- ⏳ Dify Webhook実装
- ⏳ SwitchBot API連携
- ⏳ SendGrid/Twilio統合
- ⏳ 認証機能
- ⏳ 顔写真・免許証アップロード機能

## セキュリティ考慮事項

- 個人情報（免許証・顔写真）の暗号化保管
- TLS必須
- アクセス権限管理（オーナーのみ）
- 監査ログの保存

## プライバシー

- 宿泊者からの同意取得
- データ保存期間の設定
- 削除要請への対応
