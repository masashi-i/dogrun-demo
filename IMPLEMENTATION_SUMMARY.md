# 零ちゃっちゃファーム DOG RUN — Phase 0 実装まとめ

> 作成日: 2026-03-15
> フェーズ: Phase 0（デモ版）
> ステータス: ビルド成功・全ページ実装完了

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | dogrun-demo |
| バージョン | 0.1.0 |
| フレームワーク | Next.js 16.1.6 (App Router) + TypeScript |
| スタイリング | Tailwind CSS 4 |
| フォーム管理 | react-hook-form 7 + Zod 4 |
| 日付処理 | date-fns 4 + @holiday-jp/holiday_jp 2 |
| フォント | Noto Sans JP (Google Fonts) |
| カラーテーマ | アースカラー（グリーン・ブラウン・ゴールドベージュ） |

---

## 2. ページ一覧（全20ページ）

### 2.1 公開ページ（14ページ）

| パス | ページ名 | 概要 |
|------|----------|------|
| `/` | トップページ | ヒーロースライドショー・施設ハイライト3枚・サービス紹介3枚・お知らせ・CTA |
| `/about` | 施設紹介 | コンセプト・施設特徴4項目・スタッフ紹介3名・囲いの注意事項 |
| `/services` | サービス紹介 | マッサージ・訓練士カウンセリング・ディスクドッグ体験の詳細カード |
| `/price` | 料金案内 | 通常料金表・貸し切り料金表・キャンセルポリシー・営業時間・ワクチン要件 |
| `/reserve` | 来場連絡フォーム | 日付・時刻・人数・犬情報・連絡先・ワクチン確認。リアルタイム料金計算付き |
| `/reserve/complete` | 来場連絡完了 | 受付完了メッセージ・送信内容サマリー・概算料金表示 |
| `/reserve/list` | 来場予定カレンダー | カレンダーUI・日別来場予定一覧・時間帯別犬情報・貸し切り表示 |
| `/charter` | 貸し切り予約フォーム | 日付・開始時刻・利用時間・人数・犬情報・キャンセルポリシー同意 |
| `/charter/complete` | 貸し切り予約完了 | 予約番号・料金サマリー・キャンセルポリシー再掲 |
| `/news` | お知らせ一覧 | 公開済み記事一覧（日付降順） |
| `/news/[id]` | お知らせ詳細 | 個別記事表示（動的メタデータ生成・404対応） |
| `/contact` | お問い合わせ | 種別選択（マッサージ・訓練士・ディスクドッグ・その他）・Zodバリデーション |
| `/access` | アクセス | Google Maps プレースホルダー・所在地・駐車場・交通案内 |
| `/_not-found` | 404ページ | カスタム404エラーページ |

### 2.2 管理ページ（5ページ）

| パス | ページ名 | 概要 |
|------|----------|------|
| `/admin` | ダッシュボード | 当日・翌日の来場予定サマリー・貸し切り予定テーブル |
| `/admin/reservations` | 来場連絡一覧 | 日付フィルタ・ステータス変更（受付中→確認済み→キャンセル） |
| `/admin/charters` | 貸し切り予約一覧 | ステータス変更・キャンセル料自動計算表示 |
| `/admin/news` | お知らせ管理 | 記事CRUD（作成・編集・公開/非公開切替・削除） |
| `/admin/settings` | 設定 | 臨時休業日の追加・削除（日付＋理由） |

---

## 3. コンポーネント一覧（23コンポーネント）

### 3.1 レイアウトコンポーネント（5個）

| ファイル | 概要 |
|---------|------|
| `components/layout/Header.tsx` | スティッキーヘッダー。PCナビ横並び・SPハンバーガーメニュー。CTAボタン付き |
| `components/layout/Footer.tsx` | 3カラムフッター。施設情報・ナビリンク・SNSリンク。環境変数から電話番号等取得 |
| `components/layout/MobileMenu.tsx` | スライドイン式モバイルメニュー。ルート変更時自動クローズ・スクロールロック対応 |
| `components/layout/AdminHeader.tsx` | 管理画面ヘッダー。「Phase 0 デモ版」ラベル・モバイルナビトグル |
| `components/layout/AdminSidebar.tsx` | 管理画面サイドバー。現在ルートハイライト・PCのみ表示（lg:block） |

### 3.2 フォームコンポーネント（5個）

| ファイル | 概要 |
|---------|------|
| `components/forms/ReserveForm.tsx` | 来場連絡フォーム本体。react-hook-form + Zod。犬の動的追加・料金リアルタイム計算 |
| `components/forms/CharterForm.tsx` | 貸し切り予約フォーム本体。30分単位の時刻選択・2〜8時間の利用時間選択・キャンセルポリシー展開表示 |
| `components/forms/DogFieldArray.tsx` | 犬情報の動的入力欄。useFieldArrayで追加/削除。犬種からサイズ自動セット |
| `components/forms/DogBreedInput.tsx` | 犬種サジェスト入力（コンボボックス）。49犬種プリセットからフィルタリング・サイズ自動検出 |
| `components/forms/FeeCalculator.tsx` | 料金リアルタイム表示。useWatchでフォーム値監視・平日/祝日判定・内訳表示 |

### 3.3 UIコンポーネント（12個）

| ファイル | 概要 |
|---------|------|
| `components/ui/Button.tsx` | 4バリアント（primary/secondary/outline/ghost）・3サイズ。forwardRef対応 |
| `components/ui/Input.tsx` | テキスト入力。ラベル・エラー表示・必須マーク。forwardRef対応 |
| `components/ui/Textarea.tsx` | 複数行テキスト入力。縦リサイズ可能 |
| `components/ui/Select.tsx` | ドロップダウン選択。プレースホルダー対応 |
| `components/ui/Checkbox.tsx` | チェックボックス。ラベル・エラー表示。最小タップ領域44px確保 |
| `components/ui/RadioGroup.tsx` | ラジオボタングループ。options配列で選択肢定義 |
| `components/ui/Card.tsx` | カードコンテナ。角丸・シャドウ・ボーダー |
| `components/ui/Container.tsx` | 最大幅1280px。レスポンシブパディング |
| `components/ui/SectionTitle.tsx` | セクション見出し。サブタイトル・アクセントカラーのアンダーライン |
| `components/ui/Badge.tsx` | ステータスバッジ。4バリアント（received/confirmed/cancelled/default） |
| `components/ui/Calendar.tsx` | インタラクティブカレンダー。来場/貸し切り/休業日表示・月ナビゲーション |
| `components/ui/HeroSlideshow.tsx` | 自動ローテーション画像スライドショー（5秒間隔・フェード遷移） |

### 3.4 管理画面コンポーネント（1個）

| ファイル | 概要 |
|---------|------|
| `components/admin/StatusBadge.tsx` | ステータス表示。予約/貸し切りのステータスをBadgeコンポーネントで色分け表示 |

---

## 4. ライブラリ・ユーティリティ（6ファイル）

| ファイル | 概要 |
|---------|------|
| `lib/feeCalculator.ts` | 料金計算ロジック。通常料金（平日800円/祝日1,000円 + 追加料金）・貸し切り料金（2h=5,000円〜）・キャンセル料計算 |
| `lib/validations.ts` | Zodバリデーションスキーマ。来場連絡・貸し切り予約・お問い合わせの3スキーマ |
| `lib/dogBreeds.ts` | 犬種プリセットリスト（49犬種）。小型・中型・大型＋ミックスの分類とサイズ検索関数 |
| `lib/dummyData.ts` | Phase 0用ダミーデータ。来場連絡7件・貸し切り2件・お知らせ4件・臨時休業日1件 |
| `lib/constants.ts` | 定数定義。ナビ項目・キャンセルポリシー・営業時間・ステータスラベル・問い合わせ種別 |
| `lib/utils.ts` | ユーティリティ関数。cn()（クラス名結合）・formatYen()（円表示）・formatDate()（日付表示） |

---

## 5. 型定義

| ファイル | 内容 |
|---------|------|
| `types/index.ts` | DogSize / DogGender / ReservationStatus / CharterStatus / Dog / Reservation / CharterReservation / News / ClosedDay / InquiryType |

---

## 6. 設定ファイル

| ファイル | 内容 |
|---------|------|
| `next.config.ts` | Unsplashからのリモート画像許可設定 |
| `app/globals.css` | Tailwindインポート・カスタムカラーパレット（CSS変数）・Noto Sans JPフォント・iOSズーム防止 |
| `.env.local` | サイト名・電話番号・住所・Instagram URL（すべてNEXT_PUBLIC_プレフィックス） |
| `package.json` | 依存パッケージ定義（Next.js 16 / React 19 / Tailwind 4 / Zod 4 等） |

---

## 7. カラーパレット

| トークン | カラーコード | 用途 |
|---------|-------------|------|
| `primary` | `#5C7A4E` | 深グリーン（メインカラー） |
| `primary-light` | `#7A9E6A` | ライトグリーン |
| `primary-dark` | `#3D5235` | ダークグリーン |
| `secondary` | `#8B6347` | ブラウン（セカンダリ） |
| `secondary-light` | `#A67C5B` | ライトブラウン |
| `secondary-dark` | `#6B4A32` | ダークブラウン |
| `accent` | `#C8A96E` | ゴールドベージュ（アクセント） |
| `surface` | `#F5F0E8` | クリーム（背景） |
| `surface-dark` | `#EDE5D5` | ダーククリーム |
| `text` | `#2C2416` | ダークブラウン（本文） |
| `text-muted` | `#6B5C47` | ミュートテキスト |

---

## 8. 主要機能の実装状況

### 来場連絡フォーム
- [x] 来場日カレンダー選択（過去日・臨時休業日は選択不可）
- [x] 来場予定時刻テキスト入力
- [x] 大人人数入力
- [x] 犬の情報動的追加/削除（名前・犬種サジェスト・サイズ自動セット・性別）
- [x] 連絡先入力（代表者名・電話番号・メール）
- [x] ワクチン接種確認チェックボックス
- [x] 料金リアルタイム計算（平日/祝日判定・人数/頭数反映）
- [x] Zodバリデーション
- [x] 完了ページ（送信内容サマリー表示）
- [ ] メール送信（Phase 2）
- [ ] DB保存（Phase 1）

### 貸し切り予約フォーム
- [x] 貸し切り日カレンダー選択
- [x] 開始時刻選択（30分単位・9:00〜17:30）
- [x] 利用時間選択（2〜8時間）
- [x] 犬の情報動的入力（来場連絡と共通）
- [x] キャンセルポリシー展開表示＋同意チェック
- [x] 貸し切り料金 + 利用料金のリアルタイム計算
- [x] 完了ページ（予約番号・キャンセルポリシー再掲）
- [ ] メール送信（Phase 2）
- [ ] DB保存（Phase 1）

### 来場予定カレンダー
- [x] 月表示カレンダー（前月/翌月ナビゲーション）
- [x] 日別来場人数・犬数の表示
- [x] 貸し切り日のマーク表示
- [x] 臨時休業日のマーク表示
- [x] 日付選択で詳細パネル表示（時間帯別犬情報・サイズ色分けバッジ）

### 管理画面
- [x] ダッシュボード（当日・翌日の予定サマリー）
- [x] 来場連絡一覧（日付フィルタ・ステータス変更）
- [x] 貸し切り予約一覧（ステータス変更・キャンセル料自動計算）
- [x] お知らせCRUD（作成・編集・公開/非公開・削除）
- [x] 臨時休業日設定（追加・削除）
- [ ] 認証保護（Phase 3）
- [ ] DB連携（Phase 1）

### お問い合わせフォーム
- [x] 種別選択（マッサージ・訓練士・ディスクドッグ・その他）
- [x] 連絡先・犬情報・希望日時・内容入力
- [x] Zodバリデーション
- [x] 送信完了表示（Phase 0はコンソールログのみ）

### レスポンシブ対応
- [x] モバイルファースト設計
- [x] ハンバーガーメニュー（スライドイン式）
- [x] タップ領域44px以上確保
- [x] iOS自動ズーム防止（font-size: 16px以上）
- [x] 管理画面のサイドバー/スタック切替

---

## 9. ディレクトリ構成

```
dogrun-demo/
├── app/
│   ├── globals.css              # グローバルスタイル・カラーパレット
│   ├── layout.tsx               # ルートレイアウト（Noto Sans JP・メタデータ）
│   ├── not-found.tsx            # 404ページ
│   ├── (public)/                # 公開ページグループ
│   │   ├── layout.tsx           # Header + Footer 共通レイアウト
│   │   ├── page.tsx             # トップページ
│   │   ├── about/page.tsx
│   │   ├── services/page.tsx
│   │   ├── price/page.tsx
│   │   ├── access/page.tsx
│   │   ├── reserve/
│   │   │   ├── page.tsx         # 来場連絡フォーム
│   │   │   ├── complete/page.tsx
│   │   │   └── list/page.tsx    # 来場予定カレンダー
│   │   ├── charter/
│   │   │   ├── page.tsx         # 貸し切り予約フォーム
│   │   │   └── complete/page.tsx
│   │   ├── news/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── contact/page.tsx
│   └── admin/                   # 管理画面
│       ├── layout.tsx           # AdminHeader + AdminSidebar レイアウト
│       ├── page.tsx             # ダッシュボード
│       ├── reservations/page.tsx
│       ├── charters/page.tsx
│       ├── news/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── layout/                  # Header, Footer, MobileMenu, Admin系
│   ├── forms/                   # ReserveForm, CharterForm, DogFieldArray, DogBreedInput, FeeCalculator
│   ├── ui/                      # Button, Input, Card, Calendar 等12個
│   └── admin/                   # StatusBadge
├── lib/
│   ├── feeCalculator.ts         # 料金計算ロジック
│   ├── validations.ts           # Zodスキーマ
│   ├── dogBreeds.ts             # 犬種プリセット（49犬種）
│   ├── dummyData.ts             # Phase 0ダミーデータ
│   ├── constants.ts             # 定数定義
│   └── utils.ts                 # ユーティリティ関数
├── types/
│   └── index.ts                 # 共通型定義
├── .env.local                   # 環境変数
├── next.config.ts               # Next.js設定
├── package.json
└── dogrun_requirements.md       # 要件定義書
```

---

## 10. Phase 0 で未実装（後フェーズ対応）

| 機能 | 対応フェーズ |
|------|-------------|
| DB接続（Prisma / Vercel Postgres） | Phase 1 |
| API Routes 実装 | Phase 1 |
| メール送信（Resend） | Phase 2 |
| 管理画面認証（NextAuth.js） | Phase 3 |
| Instagram フィード連携 | Phase 4 |
| Google Maps 埋め込み | Phase 4 |
| SEO / OGP / sitemap.xml | Phase 4 |
| Lighthouse 最適化 | Phase 4 |

---

## 11. 起動方法

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番モード起動
npm start
```

開発サーバー起動後、`http://localhost:3000` でアクセス可能。
