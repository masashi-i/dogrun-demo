"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { calcFee, calcCharterFee, getDayType } from "@/lib/feeCalculator";
import { formatYen } from "@/lib/utils";
import type { DayType } from "@/lib/feeCalculator";

interface FeeCalculatorProps {
  /** trueの場合、貸し切り料金も表示 */
  isCharter?: boolean;
}

export function FeeCalculator({ isCharter = false }: FeeCalculatorProps) {
  const { control } = useFormContext();

  const visitDate = useWatch({ control, name: "visitDate" });
  const adultCount = useWatch({ control, name: "adultCount" });
  const dogs = useWatch({ control, name: "dogs" });
  const hours = useWatch({ control, name: "hours" });

  // 日付から曜日種別を判定
  let dayType: DayType = "weekday";
  if (visitDate) {
    try {
      dayType = getDayType(new Date(visitDate));
    } catch {
      // 無効な日付の場合はデフォルト
    }
  }

  const dogCount = Array.isArray(dogs) ? dogs.length : 0;
  const adults = typeof adultCount === "number" ? adultCount : 0;

  // 通常利用料金
  const usageFee = calcFee(dayType, adults, dogCount);

  // 貸し切り料金
  const charterFee = isCharter && typeof hours === "number" ? calcCharterFee(hours) : 0;

  return (
    <div className="rounded-lg bg-accent/20 border border-accent/40 p-4 space-y-2">
      <h4 className="font-medium text-text">概算料金</h4>

      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-text-muted">
            区分：{dayType === "weekday" ? "平日" : "土日祝"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-muted">
            利用料金（{adults}人 + {dogCount}頭）
          </span>
          <span className="font-medium">{formatYen(usageFee)}</span>
        </div>

        {isCharter && (
          <div className="flex justify-between">
            <span className="text-text-muted">
              貸し切り料金（{hours || 0}時間）
            </span>
            <span className="font-medium">{formatYen(charterFee)}</span>
          </div>
        )}

        <div className="border-t border-accent/40 pt-2 flex justify-between">
          <span className="font-medium">合計（税込）</span>
          <span className="text-lg font-bold text-primary">
            {formatYen(usageFee + charterFee)}
          </span>
        </div>
      </div>

      {isCharter ? (
        <p className="text-xs text-text-muted">
          ※ 利用料金（人数・頭数分）は別途当日現金払いとなります
        </p>
      ) : (
        <p className="text-xs text-text-muted">
          ※ 当日現金でのお支払いとなります。キャンセル料はかかりません。
        </p>
      )}
    </div>
  );
}
