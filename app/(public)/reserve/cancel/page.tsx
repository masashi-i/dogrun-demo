"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatYen } from "@/lib/utils";

interface ReservationInfo {
  date: string;
  time: string;
  representative_name: string;
  adult_count: number;
  estimated_fee: number;
  status: string;
}

export default function ReserveCancelPage() {
  return (
    <Suspense fallback={
      <section className="py-16"><Container><p className="text-center text-text-muted">読み込み中...</p></Container></section>
    }>
      <ReserveCancelContent />
    </Suspense>
  );
}

function ReserveCancelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [reservation, setReservation] = useState<ReservationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("無効なリンクです");
      setLoading(false);
      return;
    }
    async function loadData() {
      try {
        const res = await fetch(`/api/reservations?cancel_token=${token}`);
        if (!res.ok) {
          throw new Error("予約が見つかりません");
        }
        const data = await res.json();
        setReservation(data);
        if (data.status === "CANCELLED") {
          setCancelled(true);
        }
      } catch {
        setError("予約が見つかりません。リンクが無効か、すでに削除されている可能性があります。");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  async function handleCancel() {
    if (!token) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/reservations?cancel_token=${token}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "キャンセルに失敗しました");
      }
      setCancelled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "キャンセルに失敗しました");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <section className="bg-primary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">来場連絡キャンセル</h1>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <div className="max-w-lg mx-auto">
            {loading ? (
              <p className="text-center text-text-muted">読み込み中...</p>
            ) : error ? (
              <Card className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </Card>
            ) : cancelled ? (
              <Card className="text-center py-8">
                <p className="text-2xl mb-2">✅</p>
                <h2 className="text-lg font-bold mb-2">キャンセルが完了しました</h2>
                <p className="text-text-muted text-sm">
                  来場連絡をキャンセルしました。キャンセル料はかかりません。
                </p>
              </Card>
            ) : reservation ? (
              <Card>
                <h2 className="font-bold text-lg mb-4">以下の来場連絡をキャンセルしますか？</h2>
                <div className="space-y-2 mb-6 p-4 bg-surface-dark rounded-lg">
                  <p className="text-sm">
                    <span className="text-text-muted">代表者：</span>
                    {reservation.representative_name}
                  </p>
                  <p className="text-sm">
                    <span className="text-text-muted">来場日：</span>
                    {reservation.date}
                  </p>
                  <p className="text-sm">
                    <span className="text-text-muted">時刻：</span>
                    {reservation.time}
                  </p>
                  <p className="text-sm">
                    <span className="text-text-muted">概算料金：</span>
                    {formatYen(reservation.estimated_fee)}
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700 mb-6">
                  キャンセル料はかかりません。
                </div>

                <Button
                  onClick={handleCancel}
                  disabled={cancelling}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  {cancelling ? "キャンセル処理中..." : "来場連絡をキャンセルする"}
                </Button>
              </Card>
            ) : null}
          </div>
        </Container>
      </section>
    </>
  );
}
