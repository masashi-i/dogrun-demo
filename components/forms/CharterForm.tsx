"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { charterSchema, type CharterInput } from "@/lib/validations";
import { calcCharterFee, calcFee, getDayType } from "@/lib/feeCalculator";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { DogFieldArray } from "./DogFieldArray";
import { FeeCalculator } from "./FeeCalculator";
import { CANCEL_POLICY_TEXT } from "@/lib/constants";

// 開始時刻の選択肢（30分単位）
const START_TIME_OPTIONS = Array.from({ length: 17 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const min = i % 2 === 0 ? "00" : "30";
  const time = `${String(hour).padStart(2, "0")}:${min}`;
  return { value: time, label: time };
});

// 利用時間の選択肢
const HOURS_OPTIONS = Array.from({ length: 7 }, (_, i) => ({
  value: String(i + 2),
  label: `${i + 2}時間`,
}));

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export function CharterForm() {
  const router = useRouter();
  const [policyOpen, setPolicyOpen] = useState(false);
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

  const methods = useForm<CharterInput>({
    resolver: zodResolver(charterSchema),
    defaultValues: {
      visitDate: "",
      startTime: "",
      hours: 2,
      adultCount: 1,
      dogs: [{ name: "", breed: "", size: undefined as unknown as "SMALL", gender: undefined as unknown as "MALE" }],
      guestName: "",
      phone: "",
      email: "",
      vaccineConfirmed: false as unknown as true,
      policyAgreed: false as unknown as true,
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

  const checkDate = useCallback((date: string) => {
    if (!date || regularHolidays.length === 0) {
      setDateWarning("");
      return;
    }
    const d = new Date(date + "T00:00:00");
    const dayOfWeek = d.getDay();
    if (regularHolidays.includes(dayOfWeek)) {
      setDateWarning(`${DAY_LABELS[dayOfWeek]}曜日は定休日のため貸し切り予約できません`);
    } else {
      setDateWarning("");
    }
  }, [regularHolidays]);

  useEffect(() => {
    checkDate(watchedDate);
  }, [watchedDate, checkDate]);

  async function onSubmit(data: CharterInput) {
    setSubmitError("");
    const dayType = getDayType(new Date(data.visitDate));
    const charterFee = calcCharterFee(data.hours);
    const usageFee = calcFee(dayType, data.adultCount, data.dogs.length);

    const payload = {
      date: data.visitDate,
      start_time: data.startTime,
      duration: data.hours,
      adult_count: data.adultCount,
      dogs: data.dogs,
      representative_name: data.guestName,
      phone: data.phone,
      email: data.email,
      vaccine_confirmed: data.vaccineConfirmed,
      cancel_policy_agreed: data.policyAgreed,
      note: data.note || "",
      charter_fee: charterFee,
      estimated_usage_fee: usageFee,
      status: "CONFIRMED",
    };

    try {
      const res = await fetch("/api/charters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "送信に失敗しました");
      }

      const result = await res.json();

      const params = new URLSearchParams({
        charterFee: String(charterFee),
        usageFee: String(usageFee),
        name: data.guestName,
        date: data.visitDate,
        startTime: data.startTime,
        hours: String(data.hours),
        reservationNumber: result.reservation_number ?? "",
      });
      router.push(`/charter/complete?${params.toString()}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "送信に失敗しました。しばらくしてからもう一度お試しください。");
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 貸し切り日時 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="貸し切り希望日"
            type="date"
            required
            min={today}
            {...register("visitDate")}
            error={errors.visitDate?.message}
          />
          <Select
            label="開始時刻"
            required
            options={START_TIME_OPTIONS}
            placeholder="選択してください"
            {...register("startTime")}
            error={errors.startTime?.message}
          />
          <Select
            label="利用時間"
            required
            options={HOURS_OPTIONS}
            {...register("hours", { valueAsNumber: true })}
            error={errors.hours?.message}
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
        <FeeCalculator isCharter />

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

        {/* キャンセルポリシー */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setPolicyOpen(!policyOpen)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${policyOpen ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
            キャンセルポリシーを確認する
          </button>

          {policyOpen && (
            <div className="rounded-lg bg-surface-dark border border-secondary/20 p-4">
              <pre className="text-sm text-text whitespace-pre-wrap font-sans">
                {CANCEL_POLICY_TEXT}
              </pre>
            </div>
          )}

          <Checkbox
            label="キャンセルポリシーの内容を確認し、同意します"
            {...register("policyAgreed")}
            error={errors.policyAgreed?.message}
          />
        </div>

        {/* 備考 */}
        <Textarea
          label="備考"
          placeholder="利用目的やご要望があればご記入ください"
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
            {isSubmitting ? "送信中..." : "貸し切り予約を送信する"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
