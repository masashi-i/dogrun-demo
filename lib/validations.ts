import { z } from "zod";

const dogSchema = z.object({
  name: z.string().min(1, "犬の名前を入力してください"),
  breed: z.string().min(1, "犬種を入力してください"),
  size: z.enum(["LARGE", "MEDIUM", "SMALL"], {
    message: "サイズを選択してください",
  }),
  gender: z.enum(["MALE", "FEMALE"], {
    message: "性別を選択してください",
  }),
});

export const reservationSchema = z.object({
  visitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付を選択してください"),
  visitTime: z.string().min(1, "来場予定時刻を入力してください"),
  adultCount: z.number().int().min(1, "人数は1人以上です"),
  dogs: z.array(dogSchema).min(1, "犬の情報を1頭以上入力してください"),
  guestName: z.string().min(1, "お名前を入力してください"),
  phone: z
    .string()
    .regex(/^[0-9\-+]+$/, "電話番号の形式が正しくありません"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  vaccineConfirmed: z.literal(true, {
    message: "ワクチン接種確認が必要です",
  }),
  note: z.string().optional(),
});

export const charterSchema = z.object({
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  hours: z.number().int().min(2, "貸し切りは2時間以上です"),
  adultCount: z.number().int().min(1),
  dogs: z.array(dogSchema).min(1),
  guestName: z.string().min(1),
  phone: z.string().regex(/^[0-9\-+]+$/),
  email: z.string().email(),
  vaccineConfirmed: z.literal(true, {
    message: "ワクチン接種確認が必要です",
  }),
  policyAgreed: z.literal(true, {
    message: "キャンセルポリシーへの同意が必要です",
  }),
  note: z.string().optional(),
});

export const contactSchema = z.object({
  inquiryType: z.enum(["massage", "trainer", "discdog", "other"], {
    message: "お問い合わせ種別を選択してください",
  }),
  name: z.string().min(1, "お名前を入力してください"),
  phone: z
    .string()
    .regex(/^[0-9\-+]+$/, "電話番号の形式が正しくありません"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  dogInfo: z.string().optional(),
  preferredDate: z.string().optional(),
  content: z.string().min(1, "お問い合わせ内容を入力してください"),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
export type CharterInput = z.infer<typeof charterSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
