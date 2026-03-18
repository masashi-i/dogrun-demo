# 零ちゃっちゃファーム DOG RUN — HP 要件定義書

> Claude Code CLI 用プロジェクト仕様書  
> 最終更新: 2026-03-01

---

## 0. 開発フェーズ

### Phase 0 — デモ版 ✅ 最初に作成

> ダミーデータ・ハードコードで動作確認できる状態。DB・メール・認証は不要。

| 対象 | 内容 |
|------|------|
| 全ページのUI枠 | ヘッダー・フッター・ナビ込みで全ページを表示 |
| 料金ページ | 実際の料金表をハードコードで表示 |
| 来場連絡フォーム | バリデーション・料金計算動作確認（送信はコンソールログのみ） |
| 貸し切りフォーム | バリデーション・料金計算・キャンセルポリシー表示（送信はコンソールログのみ） |
| 管理画面 | `lib/dummyData.ts` のダミーデータで予約一覧・詳細表示 |
| カラー・デザイン | アースカラーテーマ適用 |

**Phase 0 では実装しないもの（後フェーズで追加）**

| 機能 | フェーズ |
|------|---------|
| DB接続（Prisma / Vercel Postgres） | Phase 1 |
| メール送信（Resend） | Phase 2 |
| 管理画面認証（NextAuth.js） | Phase 3 |
| Instagram フィード連携 | Phase 4 |
| Google Maps 埋め込み | Phase 4 |
| SEO / OGP / sitemap | Phase 4 |

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| 施設名 | 零ちゃっちゃファーム |
| サイト表示名 | 零ちゃっちゃファーム DOG RUN |
| 所在地 | 多治見市下沢町（番地：TODO） |
| 電話番号 | TODO（サイト掲載あり） |
| メールアドレス | TODO（問い合わせ・通知用） |
| Instagram | @reichaccha_farm_whippet |
| 施設規模 | 2,000㎡ 人工芝 |
| 特徴 | 全犬種対応・大型犬も全力疾走可 / 手作り囲い（現地確認推奨） |
| スタッフ | 犬の訓練士 / 犬護舎流マッサージ技術者（予約制） / ディスクドッグチャンピオン |
| 定休日 | 年中無休（不定休はお知らせで告知） |
| 営業時間 | 9:00 〜 日没（季節により変動） |
| フレームワーク | Next.js 14+ (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| ホスティング | Vercel |
| 決済 | なし（当日現金払いのみ） |
| 会員登録 | 不要（ゲスト来場連絡のみ） |
| カラーテーマ | ナチュラル・アースカラー（グリーン・ブラウン系） |
| デザイン方針 | 温かみのある自然派・犬と過ごす屋外感 |

---

## 2. ページ構成

### 2.1 公開ページ

| パス | ページ名 | 概要 |
|------|----------|------|
| `/` | トップページ | キービジュアル・施設ハイライト・CTA（来場連絡・貸し切りへの導線） |
| `/about` | 施設紹介 | コンセプト・2,000㎡人工芝・全犬種対応・スタッフ紹介・囲いの注意事項 |
| `/services` | サービス紹介 | ドッグマッサージ（予約制）・訓練士カウンセリング・ディスクドッグ体験 |
| `/price` | 料金案内 | 料金表（平日/土日祝・追加料金）・貸し切り料金・営業時間・ワクチン要件 |
| `/reserve` | 来場連絡フォーム | 来場日時・人数・犬情報（名前/犬種/サイズ/性別）入力 |
| `/reserve/complete` | 来場連絡完了 | 受付完了メッセージ・概算料金表示 |
| `/charter` | 貸し切り予約 | 貸し切り時間選択・料金計算・キャンセルポリシー同意 |
| `/charter/complete` | 貸し切り予約完了 | 予約番号・キャンセルポリシー再掲 |
| `/news` | お知らせ一覧 | 臨時休業・イベント告知 |
| `/news/[id]` | お知らせ詳細 | 個別記事ページ |
| `/contact` | お問い合わせ | メールフォーム（マッサージ・訓練士の問い合わせも兼ねる） |
| `/access` | アクセス | Google Maps・駐車場・交通案内 |

### 2.2 管理ページ（オーナー用）

| パス | ページ名 | 概要 |
|------|----------|------|
| `/admin` | ダッシュボード | 当日・翌日の来場予定一覧 |
| `/admin/reservations` | 来場連絡一覧 | 日付フィルタ・ステータス変更 |
| `/admin/charters` | 貸し切り予約一覧 | ステータス・キャンセル料管理 |
| `/admin/news` | お知らせ管理 | 記事のCRUD |
| `/admin/settings` | 設定 | 臨時休業日の追加・削除 |

---

## 3. 機能要件

### 3.1 来場連絡フォーム（通常来場）

> **厳密な時間枠予約ではなく「来場連絡」方式。キャンセル料なし。**  
> 例：「明日9時頃行きます」「30分後に着きます」

**入力項目**

| 項目 | 入力種別 | 必須 | 備考 |
|------|---------|------|------|
| 来場希望日 | カレンダー選択 | ✅ | 過去日・臨時休業日は選択不可 |
| 来場予定時刻 | テキスト | ✅ | 例：「9時頃」「30分後」 |
| 大人の人数 | 数値（1〜） | ✅ | 料金計算に使用 |
| 犬の情報 | 繰り返し入力（頭数制限なし） | ✅ 1頭以上 | 下記参照 |
| 代表者名 | テキスト | ✅ | |
| 電話番号 | テキスト | ✅ | |
| メールアドレス | テキスト | ✅ | 確認メール送付先 |
| ワクチン・狂犬病接種確認 | チェックボックス | ✅ | 「1年以内の証明を持参します」 |
| 備考 | テキストエリア | — | |

**犬の情報（1頭ごとに入力）**

| 項目 | 入力種別 | 必須 | 備考 |
|------|---------|------|------|
| 犬の名前 | テキスト | ✅ | |
| 犬種 | テキスト + サジェスト | ✅ | プリセット選択 or 自由入力。選択時にサイズ自動セット |
| サイズ | ラジオ（大型 / 中型 / 小型） | ✅ | 犬種選択時に自動セット・手動変更可 |
| 性別 | ラジオ（オス / メス） | ✅ | |

> **サイズ目安（フォーム上に表示）：** 小型 〜10kg / 中型 10〜25kg / 大型 25kg〜

**料金リアルタイム計算**

| 区分 | 基本料金（1人＋1頭） | 追加（1人 or 1頭ごと） |
|------|---------------------|----------------------|
| 平日 | 800円 | ＋300円 |
| 土日祝 | 1,000円 | ＋400円 |

- 人数・頭数入力時にリアルタイムで概算料金を表示
- 「キャンセル料はかかりません」を明記

**送信後の処理**
- オーナーへ通知メール送信
- 利用者へ確認メール（来場連絡内容・料金目安を記載）

---

### 3.2 貸し切り予約

> **通常来場連絡とは別フロー。キャンセル料が発生するため厳密な予約管理が必要。**

**入力項目**

| 項目 | 入力種別 | 必須 | 備考 |
|------|---------|------|------|
| 貸し切り希望日 | カレンダー選択 | ✅ | 過去日・臨時休業日は選択不可 |
| 開始時刻 | 時刻選択（30分単位） | ✅ | |
| 利用時間数 | セレクト（2h / 3h / 4h / 5h …） | ✅ | 料金リアルタイム計算 |
| 大人人数 | 数値（1〜） | ✅ | 利用料金計算に使用 |
| 犬の情報 | 繰り返し入力（頭数制限なし） | ✅ 1頭以上 | 通常来場と同じ入力項目 |
| 代表者名 | テキスト | ✅ | |
| 電話番号 | テキスト | ✅ | |
| メールアドレス | テキスト | ✅ | |
| ワクチン・狂犬病接種確認 | チェックボックス | ✅ | |
| キャンセルポリシー同意 | チェックボックス | ✅ | ポリシー全文を展開表示した上でチェック |
| 備考 | テキストエリア | — | |

**貸し切り料金（利用料金は別途当日現金払い）**

| 時間 | 貸し切り料金 |
|------|-------------|
| 2時間 | 5,000円 |
| 3時間 | 6,500円 |
| 4時間目以降（1時間ごと） | ＋1,000円 |

- フォーム上で「貸し切り料金 ＋ 概算利用料金」をリアルタイム表示
- 「利用料金（人数・頭数分）は別途当日現金払い」を明記

**キャンセルポリシー（2026.1.1改訂）**

| タイミング | キャンセル料 |
|-----------|-------------|
| 3日前まで | 無料 |
| 1日前まで | 貸し切り料金の50% |
| 当日 | 貸し切り料金の100% |

- 予約完了メールにポリシー全文を必ず記載
- キャンセル連絡先（電話番号）を案内

**管理側の対応**
- 貸し切り予約が入った日時は来場連絡フォームで「貸し切り中」と表示
- キャンセルステータス変更時にキャンセル料を自動計算・管理画面に表示

---

### 3.3 管理機能

- **ダッシュボード**：当日・翌日の来場予定・貸し切り予定を一覧表示
- **来場連絡管理**：日付フィルタ・ステータス（受付中 / 確認済み / キャンセル）変更
- **貸し切り予約管理**：ステータス変更・キャンセル料計算表示
- **お知らせCRUD**：Markdown記法での記事作成・編集・削除・公開/非公開切り替え
- **臨時休業日設定**：カレンダーで休業日を追加・削除（フォームの選択不可日に反映）

---

### 3.4 専門サービス問い合わせ

> ドッグラン来場とは別枠の予約制サービス。料金未定のため問い合わせフォームで受付しオーナーから折り返し。

**サービス種別（`/contact` フォームの「お問い合わせ種別」で選択）**
- 犬護舎流マッサージ（予約制）
- 犬の訓練士カウンセリング（予約制）
- ディスクドッグ体験
- その他

**入力項目（通常お問い合わせと共通）**

| 項目 | 必須 |
|------|------|
| お問い合わせ種別 | ✅ |
| お名前 | ✅ |
| 電話番号 | ✅ |
| メールアドレス | ✅ |
| 犬の情報（犬種・年齢・名前） | — |
| 希望日時 | — |
| 内容・ご要望 | ✅ |

---

### 3.5 コンテンツ表示

- 施設写真ギャラリー（Lightbox表示、`/about` ページ）
- Google Maps 埋め込み（`/access` ページ、住所確定後）
- 料金表（レスポンシブ対応テーブル、`/price` ページ）
- Instagramフィード埋め込み（トップページ・`/about` ページ）

---

## 4. 非機能要件

| 項目 | 要件 |
|------|------|
| レスポンシブ | モバイルファースト。ブレークポイント：SP（〜767px）/ Tablet（768〜1023px）/ PC（1024px〜）。全ページSP・PC両対応必須 |
| モバイルナビ | SP・Tabletではハンバーガーメニュー。PCではヘッダー横並びナビ |
| タップ操作 | ボタン・リンクのタップ領域は最小44×44px確保。フォーム入力欄はSPでfont-size 16px以上（iOS自動ズーム防止） |
| 電話番号 | SPからは `tel:` リンクでワンタップ発信対応 |
| SEO | OGP設定・sitemap.xml・robots.txt、ローカルキーワード（多治見ドッグラン・全力疾走・ディスクドッグ・ドッグマッサージ）対応 |
| パフォーマンス | Lighthouse モバイルスコア 90点以上 |
| アクセシビリティ | alt属性必須・コントラスト比 4.5:1 以上 |
| セキュリティ | 管理ページ（`/admin/*`）はNextAuth.js で保護・フォームはZodでサーバーサイドバリデーション |
| メンテナンス性 | 臨時休業日・料金は設定ファイル or DB で管理（コード変更不要） |
| エラーハンドリング | フォーム送信失敗時はユーザーに日本語エラーメッセージを表示・オーナーにエラー通知メール |

---

## 5. 技術スタック

### フロントエンド

| パッケージ | 用途 |
|-----------|------|
| `next` 14+ | App Router・SSR・API Routes |
| `typescript` | 型安全 |
| `tailwindcss` | スタイリング |
| `react-hook-form` | フォーム管理 |
| `@hookform/resolvers` | Zodとの連携 |
| `zod` | バリデーションスキーマ |
| `date-fns` | 日付処理・平日/祝日判定 |
| `date-fns-holiday-jp` | 日本の祝日判定 |
| `next/image` | 画像最適化 |

### バックエンド（Next.js API Routes）

| エンドポイント | メソッド | 概要 |
|---------------|---------|------|
| `/api/reservations` | POST | 来場連絡登録 |
| `/api/charter` | POST | 貸し切り予約登録 |
| `/api/availability` | GET | `?date=YYYY-MM-DD` 臨時休業日チェック |
| `/api/news` | GET | お知らせ一覧取得 |
| `/api/news/[id]` | GET | お知らせ詳細取得 |
| `/api/contact` | POST | お問い合わせ送信 |
| `/api/admin/*` | 各種 | 管理画面用CRUD（認証必須） |

### インフラ・外部サービス

| サービス | 用途 |
|---------|------|
| Vercel | ホスティング・Edge Functions |
| Vercel Postgres | DB（Prisma経由） |
| Resend | メール送信（来場確認・貸し切り確認・お問い合わせ） |
| NextAuth.js | 管理画面認証（Credentials Provider） |
| SnapWidget | Instagram フィード埋め込み（Phase 4） |

---

## 6. データモデル（Prismaスキーマ）

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 来場連絡
model Reservation {
  id                String            @id @default(cuid())
  visitDate         DateTime          @db.Date
  visitTime         String
  isWeekday         Boolean
  guestName         String
  phone             String
  email             String
  adultCount        Int
  estimatedFee      Int
  vaccineConfirmed  Boolean
  status            ReservationStatus @default(RECEIVED)
  note              String?
  createdAt         DateTime          @default(now())
  dogs              Dog[]
}

// 貸し切り予約
model CharterReservation {
  id                 String        @id @default(cuid())
  visitDate          DateTime      @db.Date
  startTime          String
  hours              Int
  charterFee         Int
  adultCount         Int
  estimatedUsageFee  Int
  guestName          String
  phone              String
  email              String
  vaccineConfirmed   Boolean
  policyAgreed       Boolean
  status             CharterStatus @default(CONFIRMED)
  note               String?
  createdAt          DateTime      @default(now())
  dogs               Dog[]
}

// 犬情報（来場連絡・貸し切り共通）
model Dog {
  id                   String              @id @default(cuid())
  name                 String
  breed                String
  size                 DogSize
  gender               DogGender
  reservationId        String?
  charterReservationId String?
  reservation          Reservation?        @relation(fields: [reservationId], references: [id])
  charterReservation   CharterReservation? @relation(fields: [charterReservationId], references: [id])
}

// お知らせ
model News {
  id          String    @id @default(cuid())
  title       String
  body        String
  published   Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// 臨時休業日
model ClosedDay {
  date   DateTime @id @db.Date
  reason String?
}

enum ReservationStatus { RECEIVED CONFIRMED CANCELLED }
enum CharterStatus     { CONFIRMED CANCELLED_FREE CANCELLED_50 CANCELLED_100 }
enum DogSize           { SMALL MEDIUM LARGE }
enum DogGender         { MALE FEMALE }
```

---

## 7. バリデーションスキーマ（Zod）

```typescript
// lib/validations.ts
import { z } from "zod";

const dogSchema = z.object({
  name:   z.string().min(1, "犬の名前を入力してください"),
  breed:  z.string().min(1, "犬種を入力してください"),
  size:   z.enum(["LARGE", "MEDIUM", "SMALL"], { message: "サイズを選択してください" }),
  gender: z.enum(["MALE", "FEMALE"], { message: "性別を選択してください" }),
});

export const reservationSchema = z.object({
  visitDate:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日付を選択してください"),
  visitTime:        z.string().min(1, "来場予定時刻を入力してください"),
  adultCount:       z.number().int().min(1, "人数は1人以上です"),
  dogs:             z.array(dogSchema).min(1, "犬の情報を1頭以上入力してください"),
  guestName:        z.string().min(1, "お名前を入力してください"),
  phone:            z.string().regex(/^[0-9\-+]+$/, "電話番号の形式が正しくありません"),
  email:            z.string().email("メールアドレスの形式が正しくありません"),
  vaccineConfirmed: z.literal(true, { errorMap: () => ({ message: "ワクチン接種確認が必要です" }) }),
  note:             z.string().optional(),
});

export const charterSchema = z.object({
  visitDate:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime:        z.string().regex(/^\d{2}:\d{2}$/),
  hours:            z.number().int().min(2, "貸し切りは2時間以上です"),
  adultCount:       z.number().int().min(1),
  dogs:             z.array(dogSchema).min(1),
  guestName:        z.string().min(1),
  phone:            z.string().regex(/^[0-9\-+]+$/),
  email:            z.string().email(),
  vaccineConfirmed: z.literal(true),
  policyAgreed:     z.literal(true, { errorMap: () => ({ message: "キャンセルポリシーへの同意が必要です" }) }),
  note:             z.string().optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
export type CharterInput     = z.infer<typeof charterSchema>;
```

---

## 8. 料金計算ロジック

```typescript
// lib/feeCalculator.ts
import { isWeekend } from "date-fns";
import { isHoliday } from "date-fns-holiday-jp";

export type DayType = "weekday" | "holiday";

export const RATES = {
  weekday: { base: 800,  extra: 300 },
  holiday: { base: 1000, extra: 400 },
} as const;

/** 来場日が平日 or 土日祝かを判定 */
export function getDayType(date: Date): DayType {
  return isWeekend(date) || isHoliday(date) ? "holiday" : "weekday";
}

/** 通常来場の概算料金 */
export function calcFee(dayType: DayType, adultCount: number, dogCount: number): number {
  if (adultCount < 1 || dogCount < 1) return 0;
  const rate  = RATES[dayType];
  const extra = Math.max(adultCount - 1, 0) + Math.max(dogCount - 1, 0);
  return rate.base + extra * rate.extra;
}

/** 貸し切り料金 */
export function calcCharterFee(hours: number): number {
  if (hours < 2) return 0;
  if (hours === 2) return 5000;
  if (hours === 3) return 6500;
  return 6500 + (hours - 3) * 1000;
}

/** キャンセル料計算 */
export function calcCancelFee(charterFee: number, visitDate: Date, cancelDate: Date = new Date()): number {
  const daysLeft = Math.ceil((visitDate.getTime() - cancelDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft >= 3) return 0;
  if (daysLeft >= 1) return Math.floor(charterFee * 0.5);
  return charterFee;
}

export const BUSINESS_HOURS = { open: "09:00", close: "日没（季節により変動）" };
```

---

## 9. 犬種プリセットリスト

```typescript
// lib/dogBreeds.ts
export type DogSize  = "SMALL" | "MEDIUM" | "LARGE";
export type DogBreed = { name: string; size: DogSize };

export const DOG_BREEDS: DogBreed[] = [
  // 小型犬（〜10kg）
  { name: "チワワ",                            size: "SMALL"  },
  { name: "トイプードル",                      size: "SMALL"  },
  { name: "ポメラニアン",                      size: "SMALL"  },
  { name: "ミニチュアダックスフンド",           size: "SMALL"  },
  { name: "マルチーズ",                        size: "SMALL"  },
  { name: "ヨークシャーテリア",                size: "SMALL"  },
  { name: "シーズー",                          size: "SMALL"  },
  { name: "パピヨン",                          size: "SMALL"  },
  { name: "ミニチュアピンシャー",              size: "SMALL"  },
  { name: "イタリアングレーハウンド",          size: "SMALL"  },
  { name: "フレンチブルドッグ",                size: "SMALL"  },
  { name: "パグ",                              size: "SMALL"  },
  { name: "キャバリア",                        size: "SMALL"  },
  { name: "ビーグル",                          size: "SMALL"  },
  { name: "コーギー",                          size: "SMALL"  },
  { name: "日本スピッツ",                      size: "SMALL"  },
  // 中型犬（10〜25kg）
  { name: "柴犬",                              size: "MEDIUM" },
  { name: "ウィペット",                        size: "MEDIUM" },
  { name: "ボーダーコリー",                    size: "MEDIUM" },
  { name: "スピッツ",                          size: "MEDIUM" },
  { name: "アメリカンコッカースパニエル",      size: "MEDIUM" },
  { name: "イングリッシュスプリンガースパニエル", size: "MEDIUM" },
  { name: "シェットランドシープドッグ",        size: "MEDIUM" },
  { name: "バセットハウンド",                  size: "MEDIUM" },
  { name: "ブルドッグ",                        size: "MEDIUM" },
  { name: "ダルメシアン",                      size: "MEDIUM" },
  { name: "サモエド",                          size: "MEDIUM" },
  { name: "シベリアンハスキー",                size: "MEDIUM" },
  { name: "甲斐犬",                            size: "MEDIUM" },
  // 大型犬（25kg〜）
  { name: "ラブラドールレトリバー",            size: "LARGE"  },
  { name: "ゴールデンレトリバー",              size: "LARGE"  },
  { name: "ジャーマンシェパード",              size: "LARGE"  },
  { name: "バーニーズマウンテンドッグ",        size: "LARGE"  },
  { name: "グレートデン",                      size: "LARGE"  },
  { name: "アイリッシュセッター",              size: "LARGE"  },
  { name: "ドーベルマン",                      size: "LARGE"  },
  { name: "ロットワイラー",                    size: "LARGE"  },
  { name: "秋田犬",                            size: "LARGE"  },
  // ミックス
  { name: "ミックス（小型）",                  size: "SMALL"  },
  { name: "ミックス（中型）",                  size: "MEDIUM" },
  { name: "ミックス（大型）",                  size: "LARGE"  },
];

/** 犬種名でサイズを検索（自由入力で一致しない場合は undefined） */
export function getSizeByBreed(breed: string): DogSize | undefined {
  return DOG_BREEDS.find((b) => b.name === breed)?.size;
}
```

> **実装メモ**：comboboxパターンで実装。入力文字でリアルタイムフィルタリング。
> 犬種を選択したら `getSizeByBreed` でサイズを自動セット。リスト外の犬種は手動でサイズ選択。
> `useFieldArray`（react-hook-form）で「＋犬を追加」「削除」ボタンを動的に管理。

---

## 10. デモ用ダミーデータ

```typescript
// lib/dummyData.ts

export const DUMMY_RESERVATIONS = [
  {
    id: "res_001",
    visitDate: "2026-03-05",
    visitTime: "10時頃",
    isWeekday: true,
    guestName: "山田 太郎",
    phone: "090-0000-0001",
    email: "yamada@example.com",
    adultCount: 2,
    estimatedFee: 1100,
    vaccineConfirmed: true,
    status: "RECEIVED",
    note: "",
    dogs: [
      { id: "dog_001", name: "ハナ", breed: "ボーダーコリー", size: "MEDIUM", gender: "FEMALE" },
      { id: "dog_002", name: "クロ", breed: "ミックス（中型）", size: "MEDIUM", gender: "MALE" },
    ],
  },
  {
    id: "res_002",
    visitDate: "2026-03-05",
    visitTime: "13時頃",
    isWeekday: true,
    guestName: "鈴木 花子",
    phone: "080-0000-0002",
    email: "suzuki@example.com",
    adultCount: 1,
    estimatedFee: 800,
    vaccineConfirmed: true,
    status: "CONFIRMED",
    note: "大型犬です",
    dogs: [
      { id: "dog_003", name: "ゴン", breed: "ゴールデンレトリバー", size: "LARGE", gender: "MALE" },
    ],
  },
];

export const DUMMY_CHARTERS = [
  {
    id: "chr_001",
    visitDate: "2026-03-07",
    startTime: "10:00",
    hours: 3,
    charterFee: 6500,
    adultCount: 4,
    estimatedUsageFee: 2200,
    guestName: "田中 次郎",
    phone: "070-0000-0003",
    email: "tanaka@example.com",
    vaccineConfirmed: true,
    policyAgreed: true,
    status: "CONFIRMED",
    note: "誕生日パーティーで利用します",
    dogs: [
      { id: "dog_004", name: "モモ", breed: "トイプードル", size: "SMALL", gender: "FEMALE" },
    ],
  },
];

export const DUMMY_NEWS = [
  { id: "news_001", title: "3月15日（日）臨時休業のお知らせ", publishedAt: "2026-03-01", published: true },
  { id: "news_002", title: "春のディスクドッグ体験会開催！", publishedAt: "2026-02-20", published: true },
];
```

---

## 11. ディレクトリ構成

```
/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx                # 共通レイアウト（Header, Footer）
│   │   ├── page.tsx                  # トップページ
│   │   ├── about/page.tsx            # 施設紹介
│   │   ├── services/page.tsx         # サービス紹介
│   │   ├── price/page.tsx            # 料金案内
│   │   ├── access/page.tsx           # アクセス
│   │   ├── reserve/
│   │   │   ├── page.tsx              # 来場連絡フォーム
│   │   │   └── complete/page.tsx     # 来場連絡完了
│   │   ├── charter/
│   │   │   ├── page.tsx              # 貸し切り予約フォーム
│   │   │   └── complete/page.tsx     # 貸し切り完了
│   │   ├── news/
│   │   │   ├── page.tsx              # お知らせ一覧
│   │   │   └── [id]/page.tsx         # お知らせ詳細
│   │   └── contact/page.tsx          # お問い合わせ
│   ├── admin/
│   │   ├── layout.tsx                # 認証チェック・管理ナビ
│   │   ├── page.tsx                  # ダッシュボード
│   │   ├── reservations/page.tsx     # 来場連絡一覧
│   │   ├── charters/page.tsx         # 貸し切り予約一覧
│   │   ├── news/page.tsx             # お知らせ管理
│   │   └── settings/page.tsx         # 設定（臨時休業日）
│   └── api/
│       ├── reservations/route.ts
│       ├── charter/route.ts
│       ├── availability/route.ts
│       ├── news/route.ts
│       ├── contact/route.ts
│       └── admin/
│           ├── reservations/route.ts
│           ├── charters/route.ts
│           └── news/route.ts
├── components/
│   ├── ui/                           # Button, Input, Badge 等の汎用コンポーネント
│   ├── layout/                       # Header, Footer, Nav, MobileMenu
│   ├── forms/
│   │   ├── ReserveForm.tsx           # 来場連絡フォーム
│   │   ├── CharterForm.tsx           # 貸し切りフォーム
│   │   ├── DogFieldArray.tsx         # 犬情報の動的入力欄
│   │   ├── DogBreedInput.tsx         # 犬種サジェスト入力（combobox）
│   │   └── FeeCalculator.tsx         # 料金リアルタイム表示
│   └── admin/                        # 管理画面コンポーネント
├── lib/
│   ├── db.ts                         # Prisma client
│   ├── email.ts                      # Resend メール送信関数
│   ├── feeCalculator.ts              # 料金計算ロジック
│   ├── dogBreeds.ts                  # 犬種プリセット
│   ├── validations.ts                # Zodスキーマ
│   └── dummyData.ts                  # Phase 0 用ダミーデータ
├── types/
│   └── index.ts                      # 共通型定義
├── prisma/
│   └── schema.prisma
├── public/
│   └── images/
└── .env.local
```

---

## 12. 環境変数

```bash
# .env.local

# サイト情報（Phase 0 から使用）
NEXT_PUBLIC_SITE_NAME="零ちゃっちゃファーム DOG RUN"
NEXT_PUBLIC_PHONE="TODO"
NEXT_PUBLIC_ADDRESS="多治見市下沢町TODO"
NEXT_PUBLIC_INSTAGRAM="https://www.instagram.com/reichaccha_farm_whippet/"

# DB（Phase 1〜）
DATABASE_URL="postgresql://..."

# メール送信（Phase 2〜）
RESEND_API_KEY="re_..."
OWNER_EMAIL="TODO@example.com"
FROM_EMAIL="noreply@TODO.com"

# 管理画面認証（Phase 3〜）
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="TODO@example.com"
ADMIN_PASSWORD_HASH="..."
```

---

## 13. デザイントークン（Tailwind設定）

```typescript
// tailwind.config.ts
theme: {
  screens: {
    sm:  "640px",   // Tablet〜
    md:  "768px",   // Tablet（メインブレークポイント）
    lg:  "1024px",  // PC〜
    xl:  "1280px",
  },
  extend: {
    colors: {
      primary:   { DEFAULT: "#5C7A4E", light: "#7A9E6A", dark: "#3D5235" }, // 深グリーン
      secondary: { DEFAULT: "#8B6347", light: "#A67C5B", dark: "#6B4A32" }, // ブラウン
      accent:    { DEFAULT: "#C8A96E" },                                      // ゴールドベージュ
      surface:   { DEFAULT: "#F5F0E8", dark: "#EDE5D5" },                    // クリーム
      text:      { DEFAULT: "#2C2416", muted: "#6B5C47" },                   // ダークブラウン
    },
  },
}
```

### レスポンシブ実装方針

| 要素 | SP（〜767px） | PC（1024px〜） |
|------|--------------|---------------|
| ナビゲーション | ハンバーガーメニュー（MobileMenu） | ヘッダー横並び |
| トップキービジュアル | 縦長・フルスクリーン | 横長・中央配置 |
| 料金テーブル | 横スクロール or スタック表示 | 横並びテーブル |
| フォーム | 1カラム・フルwidth入力欄 | 2カラムレイアウト可 |
| ギャラリー | 2カラムグリッド | 3〜4カラムグリッド |
| 管理画面 | スタック表示（SP閲覧は補助的） | サイドバー＋メインの2ペイン |
| 電話番号 | `<a href="tel:TODO">` ワンタップ発信 | テキスト表示のみ |
| フォント入力欄 | `font-size: 16px` 以上（iOS ズーム防止） | 通常サイズ |
| タップ領域 | 最小 44×44px | 通常サイズ |

---

## 14. プロジェクト初期化コマンド

```bash
# プロジェクト作成
npx create-next-app@latest dogrun-hp \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd dogrun-hp

# 依存パッケージ（Phase 0 で必要なもの）
npm install react-hook-form @hookform/resolvers zod
npm install date-fns date-fns-holiday-jp

# 追加パッケージ（Phase 1〜で必要なもの）
npm install resend
npm install next-auth
npm install @prisma/client
npm install -D prisma

# DB初期化（Phase 1〜）
npx prisma init
```

---

## 15. 実装優先順位

```
Phase 0（デモ版）← まずここ
  ├─ tailwind.config.ts カラー設定
  ├─ 共通レイアウト（Header / Footer / Nav / MobileMenu）
  ├─ 全公開ページUI枠（ダミーデータ・ハードコード）
  ├─ 来場連絡フォーム（バリデーション + 料金計算）
  ├─ 貸し切りフォーム（バリデーション + 料金計算）
  └─ 管理画面UI枠（dummyData.ts で表示）

Phase 1 — DB連携
  ├─ prisma/schema.prisma 作成・マイグレーション
  ├─ API Routes 実装（reservations / charter / availability）
  └─ フォーム送信処理をDB保存に切り替え

Phase 2 — メール通知
  ├─ Resend セットアップ
  ├─ 来場連絡確認メール（利用者・オーナー）
  ├─ 貸し切り確認メール（利用者・オーナー）
  └─ お問い合わせ転送メール

Phase 3 — 管理画面認証
  ├─ NextAuth.js Credentials Provider
  ├─ /admin/* へのミドルウェアガード
  └─ 管理画面 API Routes 実装

Phase 4 — 仕上げ
  ├─ SEO / OGP / sitemap.xml / robots.txt
  ├─ Google Maps 埋め込み（住所確定後）
  ├─ Instagram フィード埋め込み（SnapWidget）
  └─ Lighthouse スコア最適化
```

---

## 16. 保留・今後の検討事項

- LINE通知連携（オーナーへの来場連絡リアルタイム通知）
- 貸し切りキャンセル料のオンライン請求（Stripe等、現状は手動請求）
- ディスクドッグ体験イベントの専用申込フォーム
- リピーター向けスタンプカード・クーポン機能
- 犬のプロフィール写真アップロード機能
