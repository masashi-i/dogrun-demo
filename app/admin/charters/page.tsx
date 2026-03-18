"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DOG_SIZE_LABELS, DOG_GENDER_LABELS } from "@/lib/constants";
import { formatYen } from "@/lib/utils";
import { calcCancelFee } from "@/lib/feeCalculator";
import { fetchCharters, updateCharterStatus } from "@/lib/api";
import type { CharterReservation, CharterStatus } from "@/types";

export default function AdminChartersPage() {
  const [charters, setCharters] = useState<CharterReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchCharters();
        setCharters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleStatusChange(id: string, newStatus: CharterStatus) {
    try {
      const updated = await updateCharterStatus(id, newStatus);
      setCharters((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "ステータスの更新に失敗しました");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">貸し切り予約一覧</h1>
        <p className="text-text-muted">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">貸し切り予約一覧</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">貸し切り予約一覧</h1>

      {charters.length === 0 ? (
        <Card>
          <p className="text-text-muted text-center py-8">
            貸し切り予約はありません
          </p>
        </Card>
      ) : (
        charters.map((c) => {
          const cancelFee = c.status.startsWith("CANCELLED")
            ? calcCancelFee(c.charterFee, new Date(c.visitDate))
            : 0;

          return (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{c.guestName}</h3>
                    <StatusBadge status={c.status} type="charter" />
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    {c.visitDate} {c.startTime}〜（{c.hours}時間）| {c.adultCount}人
                  </p>
                </div>

                {/* ステータス変更 */}
                <select
                  value={c.status}
                  onChange={(e) =>
                    handleStatusChange(
                      c.id,
                      e.target.value as CharterStatus
                    )
                  }
                  className="text-sm border border-secondary/30 rounded-lg px-2 py-1"
                >
                  <option value="CONFIRMED">確定</option>
                  <option value="CANCELLED_FREE">キャンセル（無料）</option>
                  <option value="CANCELLED_50">キャンセル（50%）</option>
                  <option value="CANCELLED_100">キャンセル（100%）</option>
                </select>
              </div>

              {/* 料金情報 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-surface-dark rounded-lg p-3">
                  <p className="text-xs text-text-muted">貸し切り料金</p>
                  <p className="font-bold text-primary">
                    {formatYen(c.charterFee)}
                  </p>
                </div>
                <div className="bg-surface-dark rounded-lg p-3">
                  <p className="text-xs text-text-muted">概算利用料金</p>
                  <p className="font-bold">{formatYen(c.estimatedUsageFee)}</p>
                </div>
                {cancelFee > 0 && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-red-600">キャンセル料</p>
                    <p className="font-bold text-red-600">
                      {formatYen(cancelFee)}
                    </p>
                  </div>
                )}
              </div>

              {/* 犬情報 */}
              <div className="space-y-1">
                {c.dogs.map((d) => (
                  <div
                    key={d.id}
                    className="text-sm text-text-muted flex gap-2"
                  >
                    <span className="font-medium text-text">{d.name}</span>
                    <span>{d.breed}</span>
                    <span>{DOG_SIZE_LABELS[d.size]}</span>
                    <span>{DOG_GENDER_LABELS[d.gender]}</span>
                  </div>
                ))}
              </div>

              {/* 連絡先 */}
              <div className="mt-3 text-sm text-text-muted flex flex-wrap gap-4">
                <span>TEL: {c.phone}</span>
                <span>Email: {c.email}</span>
              </div>

              {c.note && (
                <p className="mt-2 text-sm text-text-muted bg-surface-dark rounded p-2">
                  備考: {c.note}
                </p>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
