"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { reservationSchema, type ReservationInput } from "@/lib/validations";
import { calcFee, getDayType } from "@/lib/feeCalculator";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { DogFieldArray } from "./DogFieldArray";
import { FeeCalculator } from "./FeeCalculator";

interface ReserveFormProps {
  defaultDate?: string;
}

export function ReserveForm({ defaultDate }: ReserveFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

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
    formState: { errors, isSubmitting },
  } = methods;

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
        {/* エラーメッセージ */}
        {submitError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}

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
          <Input
            label="来場予定時刻"
            placeholder="例：9時頃、30分後"
            required
            {...register("visitTime")}
            error={errors.visitTime?.message}
          />
        </div>

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

        {/* 送信ボタン */}
        <div className="pt-4">
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "送信中..." : "来場連絡を送信する"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
