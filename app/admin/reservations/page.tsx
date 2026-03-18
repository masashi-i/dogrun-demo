"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DOG_SIZE_LABELS, DOG_GENDER_LABELS } from "@/lib/constants";
import { formatYen } from "@/lib/utils";
import { fetchReservations, updateReservationStatus } from "@/lib/api";
import type { Reservation, ReservationStatus } from "@/types";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchReservations();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = dateFilter
    ? reservations.filter((r) => r.visitDate === dateFilter)
    : reservations;

  async function handleStatusChange(id: string, newStatus: ReservationStatus) {
    try {
      const updated = await updateReservationStatus(id, newStatus);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "ステータスの更新に失敗しました");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">来場連絡一覧</h1>
        <p className="text-text-muted">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">来場連絡一覧</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">来場連絡一覧</h1>

      {/* フィルタ */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-48">
            <Input
              label="日付フィルタ"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-sm text-primary hover:text-primary-dark mb-1"
            >
              フィルタ解除
            </button>
          )}
          <span className="text-sm text-text-muted mb-1">
            {filtered.length}件
          </span>
        </div>
      </Card>

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <Card>
          <p className="text-text-muted text-center py-8">
            該当する来場連絡はありません
          </p>
        </Card>
      ) : (
        filtered.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">{r.guestName}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-sm text-text-muted mt-1">
                  {r.visitDate} {r.visitTime} | {r.adultCount}人 |{" "}
                  {formatYen(r.estimatedFee)}
                </p>
              </div>

              {/* ステータス変更 */}
              <select
                value={r.status}
                onChange={(e) =>
                  handleStatusChange(
                    r.id,
                    e.target.value as ReservationStatus
                  )
                }
                className="text-sm border border-secondary/30 rounded-lg px-2 py-1"
              >
                <option value="RECEIVED">受付中</option>
                <option value="CONFIRMED">確認済み</option>
                <option value="CANCELLED">キャンセル</option>
              </select>
            </div>

            {/* 犬情報 */}
            <div className="space-y-1">
              {r.dogs.map((d) => (
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
              <span>TEL: {r.phone}</span>
              <span>Email: {r.email}</span>
            </div>

            {r.note && (
              <p className="mt-2 text-sm text-text-muted bg-surface-dark rounded p-2">
                備考: {r.note}
              </p>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
