"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { formatYen, formatDate } from "@/lib/utils";
import { CANCEL_POLICY_TEXT } from "@/lib/constants";
import { Suspense } from "react";

function CompleteContent() {
  const searchParams = useSearchParams();
  const charterFee = Number(searchParams.get("charterFee")) || 0;
  const usageFee = Number(searchParams.get("usageFee")) || 0;
  const name = searchParams.get("name") || "";
  const date = searchParams.get("date") || "";
  const startTime = searchParams.get("startTime") || "";
  const hours = searchParams.get("hours") || "";

  // デモ用の予約番号
  const reservationId = `CHR-${date.replace(/-/g, "")}-001`;

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="text-5xl mb-6">✅</div>
      <h2 className="text-2xl font-bold mb-4">貸し切り予約を受け付けました</h2>
      <p className="text-text-muted mb-2">
        ご予約ありがとうございます。確認メールをお送りいたします。
      </p>
      <p className="text-lg font-bold text-primary mb-8">
        予約番号: {reservationId}
      </p>

      <Card className="text-left mb-8">
        <h3 className="font-bold mb-4 text-center">ご予約内容</h3>
        <dl className="space-y-3">
          {name && (
            <div className="flex justify-between py-2 border-b border-secondary/10">
              <dt className="text-text-muted">代表者名</dt>
              <dd className="font-medium">{name}</dd>
            </div>
          )}
          {date && (
            <div className="flex justify-between py-2 border-b border-secondary/10">
              <dt className="text-text-muted">貸し切り日</dt>
              <dd className="font-medium">{formatDate(date)}</dd>
            </div>
          )}
          {startTime && hours && (
            <div className="flex justify-between py-2 border-b border-secondary/10">
              <dt className="text-text-muted">時間</dt>
              <dd className="font-medium">
                {startTime}〜（{hours}時間）
              </dd>
            </div>
          )}
          {charterFee > 0 && (
            <div className="flex justify-between py-2 border-b border-secondary/10">
              <dt className="text-text-muted">貸し切り料金</dt>
              <dd className="text-lg font-bold text-primary">
                {formatYen(charterFee)}
              </dd>
            </div>
          )}
          {usageFee > 0 && (
            <div className="flex justify-between py-2">
              <dt className="text-text-muted">概算利用料金</dt>
              <dd className="font-medium">{formatYen(usageFee)}</dd>
            </div>
          )}
        </dl>
        <p className="text-sm text-text-muted mt-4">
          ※ 利用料金（人数・頭数分）は別途当日現金払いとなります
        </p>
      </Card>

      {/* キャンセルポリシー再掲 */}
      <Card className="text-left mb-8 bg-surface-dark">
        <pre className="text-sm text-text whitespace-pre-wrap font-sans">
          {CANCEL_POLICY_TEXT}
        </pre>
      </Card>

      <Link
        href="/"
        className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors min-h-[48px]"
      >
        トップページに戻る
      </Link>
    </div>
  );
}

export default function CharterCompletePage() {
  return (
    <>
      <section className="bg-secondary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">貸し切り予約完了</h1>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <Suspense fallback={<div className="text-center py-12">読み込み中...</div>}>
            <CompleteContent />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
