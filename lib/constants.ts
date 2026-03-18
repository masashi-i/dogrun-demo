/** ナビゲーション項目 */
export const NAV_ITEMS = [
  { href: "/", label: "トップ" },
  { href: "/about", label: "施設紹介" },
  { href: "/services", label: "サービス" },
  { href: "/price", label: "料金案内" },
  { href: "/reserve/list", label: "来場予定" },
  { href: "/news", label: "お知らせ" },
  { href: "/access", label: "アクセス" },
  { href: "/contact", label: "お問い合わせ" },
] as const;

/** 管理画面ナビゲーション */
export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/reservations", label: "来場連絡" },
  { href: "/admin/charters", label: "貸し切り" },
  { href: "/admin/news", label: "お知らせ" },
  { href: "/admin/settings", label: "設定" },
] as const;

/** キャンセルポリシー */
export const CANCEL_POLICY = [
  { timing: "3日前まで", fee: "無料" },
  { timing: "1日前まで", fee: "貸し切り料金の50%" },
  { timing: "当日", fee: "貸し切り料金の100%" },
] as const;

/** キャンセルポリシー全文 */
export const CANCEL_POLICY_TEXT = `【キャンセルポリシー（2026.1.1改訂）】

・3日前まで：無料
・1日前まで：貸し切り料金の50%
・当日：貸し切り料金の100%

キャンセルのご連絡はお電話にてお願いいたします。`;

/** 営業時間 */
export const BUSINESS_HOURS = {
  open: "9:00",
  close: "日没（季節により変動）",
  holiday: "年中無休（不定休はお知らせで告知）",
};

/** サイズ表記 */
export const DOG_SIZE_LABELS: Record<string, string> = {
  SMALL: "小型犬",
  MEDIUM: "中型犬",
  LARGE: "大型犬",
};

/** 性別表記 */
export const DOG_GENDER_LABELS: Record<string, string> = {
  MALE: "オス",
  FEMALE: "メス",
};

/** 予約ステータス表記 */
export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  RECEIVED: "受付中",
  CONFIRMED: "確認済み",
  CANCELLED: "キャンセル",
};

/** 貸し切りステータス表記 */
export const CHARTER_STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "確定",
  CANCELLED_FREE: "キャンセル（無料）",
  CANCELLED_50: "キャンセル（50%）",
  CANCELLED_100: "キャンセル（100%）",
};

/** お問い合わせ種別 */
export const INQUIRY_TYPES = [
  { value: "massage", label: "犬護舎流マッサージ（予約制）" },
  { value: "trainer", label: "犬の訓練士カウンセリング（予約制）" },
  { value: "discdog", label: "ディスクドッグ体験" },
  { value: "other", label: "その他" },
] as const;
