"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatYen } from "@/lib/utils";
import { CANCEL_POLICY } from "@/lib/constants";

interface CharterInfo {
  date: string;
  start_time: string;
  duration: number;
  representative_name: string;
  charter_fee: number;
  estimated_usage_fee: number;
  reservation_number: string;
  status: string;
}

/** 終了時刻を計算 */
function calcEndTime(startTime: string, hours: number): string {
  const match = startTime.match(/(\d{1,2}):(\d{2})/);
  if (!match) return "";
  const endHour = parseInt(match[1], 10) + hours;
  return `${endHour}:${match[2]}`;
}

/** キャンセル料を計算 */
function calcCancelInfo(charterFee: number, visitDate: string): { label: string; fee: number } {
  const visit = new Date(visitDate + "T00:00:00");
  const now = new Date();
  const daysLeft = Math.ceil((visit.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft >= 3) return { label: "無料（3日前まで）", fee: 0 };
  if (daysLeft >= 1) return { label: `貸し切り料金の50%（1日前まで）`, fee: Math.floor(charterFee * 0.5) };
  return { label: "貸し切り料金の100%（当日）", fee: charterFee };
}

export default function CharterCancelPage() {
  return (
    <Suspense fallback={
      <section className="py-16"><Container><p className="text-center text-text-muted">読み込み中...</p></Container></section>
    }>
      <CharterCancelContent />
    </Suspense>
  );
}

function CharterCancelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [charter, setCharter] = useState<CharterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [cancelResult, setCancelResult] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("無効なリンクです");
      setLoading(false);
      return;
    }
    async function loadData() {
      try {
        const res = await fetch(`/api/charters?cancel_token=${token}`);
        if (!res.ok) {
          throw new Error("予約が見つかりません");
        }
        const data = await res.json();
        setCharter(data);
        if (data.status !== "CONFIRMED") {
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

  const cancelInfo = charter ? calcCancelInfo(charter.charter_fee, charter.date) : null;

  async function handleCancel() {
    if (!token) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/charters?cancel_token=${token}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "キャンセルに失敗しました");
      }
      const result = await res.json();
      setCancelled(true);
      setCancelResult(result.status);
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
          <h1 className="text-3xl lg:text-4xl font-bold">貸し切り予約キャンセル</h1>
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
                {cancelResult && cancelInfo && (
                  <p className="text-text-muted text-sm">
                    {cancelInfo.fee > 0
                      ? `キャンセル料: ${formatYen(cancelInfo.fee)} が発生します。お支払いについてはお電話にてご連絡いたします。`
                      : "キャンセル料はかかりません。"
                    }
                  </p>
                )}
                {!cancelResult && (
                  <p className="text-text-muted text-sm">
                    この予約はすでにキャンセル済みです。
                  </p>
                )}
              </Card>
            ) : charter ? (
              <Card>
                <h2 className="font-bold text-lg mb-4">以下の貸し切り予約をキャンセルしますか？</h2>
                <div className="space-y-2 mb-6 p-4 bg-surface-dark rounded-lg">
                  <p className="text-sm">
                    <span className="text-text-muted">予約番号：</span>
                    {charter.reservation_number}
                  </p>
                  <p className="text-sm">
                    <span className="text-text-muted">代表者：</span>
                    {charter.representative_name}
                  </p>
                  <p className="text-sm">
                    <span className="text-text-muted">貸し切り日：</span>
                    {charter.date}
                  </p>
                  <p className="text-sm">
                    <span className="text-text-muted">時間：</span>
                    {charter.start_time}〜{calcEndTime(charter.start_time, charter.duration)}（{charter.duration}時間）
                  </p>
                  <p className="text-sm">
                    <span className="text-text-muted">貸し切り料金：</span>
                    {formatYen(charter.charter_fee)}
                  </p>
                </div>

                {/* キャンセル料案内 */}
                <div className="rounded-lg border border-secondary/20 p-4 mb-6">
                  <h3 className="font-bold text-sm mb-3">キャンセルポリシー</h3>
                  <div className="space-y-1 text-sm text-text-muted mb-3">
                    {CANCEL_POLICY.map((p) => (
                      <p key={p.timing}>・{p.timing}：{p.fee}</p>
                    ))}
                  </div>
                  {cancelInfo && (
                    <div className={`rounded-lg p-3 text-sm font-medium ${cancelInfo.fee > 0 ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                      今キャンセルした場合のキャンセル料：{cancelInfo.fee > 0 ? formatYen(cancelInfo.fee) : "無料"}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleCancel}
                  disabled={cancelling}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  {cancelling ? "キャンセル処理中..." : "貸し切り予約をキャンセルする"}
                </Button>
              </Card>
            ) : null}
          </div>
        </Container>
      </section>
    </>
  );
}
