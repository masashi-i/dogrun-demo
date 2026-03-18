import { isWeekend } from "date-fns";
import { isHoliday } from "@holiday-jp/holiday_jp";

export type DayType = "weekday" | "holiday";

export const RATES = {
  weekday: { base: 800, extra: 300 },
  holiday: { base: 1000, extra: 400 },
} as const;

/** 来場日が平日 or 土日祝かを判定 */
export function getDayType(date: Date): DayType {
  return isWeekend(date) || isHoliday(date) ? "holiday" : "weekday";
}

/** 通常来場の概算料金 */
export function calcFee(
  dayType: DayType,
  adultCount: number,
  dogCount: number
): number {
  if (adultCount < 1 || dogCount < 1) return 0;
  const rate = RATES[dayType];
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
export function calcCancelFee(
  charterFee: number,
  visitDate: Date,
  cancelDate: Date = new Date()
): number {
  const daysLeft = Math.ceil(
    (visitDate.getTime() - cancelDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft >= 3) return 0;
  if (daysLeft >= 1) return Math.floor(charterFee * 0.5);
  return charterFee;
}

export const BUSINESS_HOURS = {
  open: "09:00",
  close: "日没（季節により変動）",
};
