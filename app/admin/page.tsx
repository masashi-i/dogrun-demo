"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DOG_SIZE_LABELS } from "@/lib/constants";
import { formatYen } from "@/lib/utils";
import { fetchReservations, fetchCharters } from "@/lib/api";
import type { Reservation, CharterReservation } from "@/types";

export default function AdminDashboardPage() {
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [tomorrowReservations, setTomorrowReservations] = useState<Reservation[]>([]);
  const [upcomingCharters, setUpcomingCharters] = useState<CharterReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

        const [todayRes, tomorrowRes, charters] = await Promise.all([
          fetchReservations(today),
          fetchReservations(tomorrow),
          fetchCharters(),
        ]);

        setTodayReservations(todayRes);
        setTomorrowReservations(tomorrowRes);
        // 今日以降の貸し切り予約のみ表示
        setUpcomingCharters(charters.filter((c) => c.visitDate >= today));
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-text-muted">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-text-muted">今日の来場予定</p>
          <p className="text-3xl font-bold text-primary mt-1">
            {todayReservations.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">明日の来場予定</p>
          <p className="text-3xl font-bold text-primary mt-1">
            {tomorrowReservations.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">貸し切り予約</p>
          <p className="text-3xl font-bold text-secondary mt-1">
            {upcomingCharters.length}
          </p>
        </Card>
      </div>

      {/* 今日の来場予定 */}
      <Card>
        <h2 className="font-bold text-lg mb-4">今日の来場予定</h2>
        {todayReservations.length === 0 ? (
          <p className="text-text-muted text-sm">来場予定はありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary/20 text-left">
                  <th className="py-2 px-3 font-medium text-text-muted">
                    時刻
                  </th>
                  <th className="py-2 px-3 font-medium text-text-muted">
                    代表者
                  </th>
                  <th className="py-2 px-3 font-medium text-text-muted">
                    人数
                  </th>
                  <th className="py-2 px-3 font-medium text-text-muted">
                    犬
                  </th>
                  <th className="py-2 px-3 font-medium text-text-muted">
                    料金
                  </th>
                  <th className="py-2 px-3 font-medium text-text-muted">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody>
                {todayReservations.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-secondary/10 hover:bg-primary/5"
                  >
                    <td className="py-2 px-3">{r.visitTime}</td>
                    <td className="py-2 px-3 font-medium">{r.guestName}</td>
                    <td className="py-2 px-3">{r.adultCount}人</td>
                    <td className="py-2 px-3">
                      {r.dogs.map((d) => (
                        <span key={d.id} className="block text-xs">
                          {d.name}（{d.breed}・{DOG_SIZE_LABELS[d.size]}）
                        </span>
                      ))}
                    </td>
                    <td className="py-2 px-3">{formatYen(r.estimatedFee)}</td>
                    <td className="py-2 px-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 貸し切り予約 */}
      <Card>
        <h2 className="font-bold text-lg mb-4">今後の貸し切り予約</h2>
        {upcomingCharters.length === 0 ? (
          <p className="text-text-muted text-sm">貸し切り予約はありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary/20 text-left">
                  <th className="py-2 px-3 font-medium text-text-muted">
                    日付
                  </th>
                  <th className="py-2 px-3 font-medium text-text-muted">
                    時間
                  </th>
                  <th className="py-2 px-3 font-medium text-text-muted">
                    代表者
                  </th>
                  <th className="py-2 px-3 font-medium text-text-muted">
                    貸し切り料金
                  </th>
                  <th className="py-2 px-3 font-medium text-text-muted">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingCharters.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-secondary/10 hover:bg-primary/5"
                  >
                    <td className="py-2 px-3">{c.visitDate}</td>
                    <td className="py-2 px-3">
                      {c.startTime}〜（{c.hours}h）
                    </td>
                    <td className="py-2 px-3 font-medium">{c.guestName}</td>
                    <td className="py-2 px-3">{formatYen(c.charterFee)}</td>
                    <td className="py-2 px-3">
                      <StatusBadge status={c.status} type="charter" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
