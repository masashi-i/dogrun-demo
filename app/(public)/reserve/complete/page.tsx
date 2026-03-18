"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { formatYen, formatDate } from "@/lib/utils";
import { Suspense } from "react";

function CompleteContent() {
  const searchParams = useSearchParams();
  const fee = Number(searchParams.get("fee")) || 0;
  const name = searchParams.get("name") || "";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="text-5xl mb-6">✅</div>
      <h2 className="text-2xl font-bold mb-4">来場連絡を受け付けました</h2>
      <p className="text-text-muted mb-8">
        ご連絡ありがとうございます。確認メールをお送りいたします。
      </p>

      <Card className="text-left mb-8">
        <h3 className="font-bold mb-4 text-center">ご連絡内容</h3>
        <dl className="space-y-3">
          {name && (
            <div className="flex justify-between py-2 border-b border-secondary/10">
              <dt className="text-text-muted">代表者名</dt>
              <dd className="font-medium">{name}</dd>
            </div>
          )}
          {date && (
            <div className="flex justify-between py-2 border-b border-secondary/10">
              <dt className="text-text-muted">来場希望日</dt>
              <dd className="font-medium">{formatDate(date)}</dd>
            </div>
          )}
          {time && (
            <div className="flex justify-between py-2 border-b border-secondary/10">
              <dt className="text-text-muted">来場予定時刻</dt>
              <dd className="font-medium">{time}</dd>
            </div>
          )}
          {fee > 0 && (
            <div className="flex justify-between py-2">
              <dt className="text-text-muted">概算料金</dt>
              <dd className="text-lg font-bold text-primary">
                {formatYen(fee)}
              </dd>
            </div>
          )}
        </dl>
        <p className="text-sm text-text-muted mt-4">
          ※ 当日現金でのお支払いとなります
        </p>
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

export default function ReserveCompletePage() {
  return (
    <>
      <section className="bg-primary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">来場連絡完了</h1>
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
