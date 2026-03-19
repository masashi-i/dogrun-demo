"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { reservationSchema, type ReservationInput } from "@/lib/validations";
import { calcFee, getDayType } from "@/lib/feeCalculator";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { DogFieldArray } from "./DogFieldArray";
import { FeeCalculator } from "./FeeCalculator";

// 来場予定時刻の選択肢（9:00〜17:00、30分単位）
const VISIT_TIME_OPTIONS = Array.from({ length: 17 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const min = i % 2 === 0 ? "00" : "30";
  const time = `${hour}:${min}`;
  return { value: time, label: time };
});

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

interface ReserveFormProps {
  defaultDate?: string;
}

export function ReserveForm({ defaultDate }: ReserveFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [regularHolidays, setRegularHolidays] = useState<number[]>([]);
  const [dateWarning, setDateWarning] = useState("");

  // 定休日をロード
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/regular-holidays");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setRegularHolidays(data.map((h: { day_of_week: number }) => h.day_of_week));
        }
      } catch { /* フォールバック */ }
    }
    load();
  }, []);

  const methods = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      visitDate: defaultDate ?? "",
      visitTime: "",
      adultCount: 1,
      dogs: [{ name: "", breed: "", size: undefined as unknown as "SMALL", gender: undefined as unknown as "MALE" }],
      guestName: "",
      phone: "",
      email: "",
      vaccineConfirmed: false as unknown as true,
      note: "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const watchedDate = watch("visitDate");

  // 日付変更時に定休日チェック
  const checkDate = useCallback((date: string) => {
    if (!date || regularHolidays.length === 0) {
      setDateWarning("");
      return;
    }
    const d = new Date(date + "T00:00:00");
    const dayOfWeek = d.getDay();
    if (regularHolidays.includes(dayOfWeek)) {
      setDateWarning(`${DAY_LABELS[dayOfWeek]}曜日は定休日のため来場連絡できません`);
    } else {
      setDateWarning("");
    }
  }, [regularHolidays]);

  useEffect(() => {
    checkDate(watchedDate);
  }, [watchedDate, checkDate]);

  async function onSubmit(data: ReservationInput) {
    setSubmitError("");
    const dayType = getDayType(new Date(data.visitDate));
    const isWeekday = dayType === "weekday";
    const fee = calcFee(dayType, data.adultCount, data.dogs.length);

    const payload = {
      date: data.visitDate,
      time: data.visitTime,
      adult_count: data.adultCount,
      dogs: data.dogs,
      representative_name: data.guestName,
      phone: data.phone,
      email: data.email,
      vaccine_confirmed: data.vaccineConfirmed,
      note: data.note || "",
      estimated_fee: fee,
      is_weekday: isWeekday,
      status: "RECEIVED",
    };

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "送信に失敗しました");
      }

      const params = new URLSearchParams({
        fee: String(fee),
        name: data.guestName,
        date: data.visitDate,
        time: data.visitTime,
      });
      router.push(`/reserve/complete?${params.toString()}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "送信に失敗しました。しばらくしてからもう一度お試しください。");
    }
  }

  // 来場日の最小値（今日）
  const today = new Date().toISOString().split("T")[0];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 来場日時 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="来場希望日"
            type="date"
            required
            min={today}
            {...register("visitDate")}
            error={errors.visitDate?.message}
          />
          <Select
            label="来場予定時刻"
            required
            options={VISIT_TIME_OPTIONS}
            placeholder="選択してください"
            {...register("visitTime")}
            error={errors.visitTime?.message}
          />
        </div>

        {/* 定休日警告 */}
        {dateWarning && (
          <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 text-sm text-amber-800 flex items-start gap-2">
            <span className="shrink-0">⚠️</span>
            <span>{dateWarning}</span>
          </div>
        )}

        {/* 人数 */}
        <Input
          label="大人の人数"
          type="number"
          min={1}
          required
          {...register("adultCount", { valueAsNumber: true })}
          error={errors.adultCount?.message}
        />

        {/* 犬の情報 */}
        <DogFieldArray />

        {/* 料金表示 */}
        <FeeCalculator />

        {/* 連絡先 */}
        <div className="space-y-4">
          <h3 className="font-medium text-text border-b border-secondary/20 pb-2">
            連絡先情報
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="代表者名"
              required
              {...register("guestName")}
              error={errors.guestName?.message}
            />
            <Input
              label="電話番号"
              type="tel"
              placeholder="090-0000-0000"
              required
              {...register("phone")}
              error={errors.phone?.message}
            />
          </div>
          <Input
            label="メールアドレス"
            type="email"
            placeholder="example@email.com"
            required
            {...register("email")}
            error={errors.email?.message}
          />
        </div>

        {/* ワクチン確認 */}
        <Checkbox
          label="混合ワクチン・狂犬病予防接種の証明書を当日持参します（1年以内のもの）"
          {...register("vaccineConfirmed")}
          error={errors.vaccineConfirmed?.message}
        />

        {/* 備考 */}
        <Textarea
          label="備考"
          placeholder="気になることがあればご記入ください"
          {...register("note")}
        />

        {/* エラーメッセージ */}
        {submitError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* 送信ボタン */}
        <div className="pt-4">
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !!dateWarning}>
            {isSubmitting ? "送信中..." : "来場連絡を送信する"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
