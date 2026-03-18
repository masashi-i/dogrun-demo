"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { fetchClosedDays, createClosedDay, deleteClosedDay } from "@/lib/api";
import type { ClosedDay } from "@/types";

export default function AdminSettingsPage() {
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchClosedDays();
        setClosedDays(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleAdd() {
    if (!newDate) return;
    if (closedDays.some((d) => d.date === newDate)) return;

    setSaving(true);
    try {
      const created = await createClosedDay({ date: newDate, reason: newReason || undefined });
      setClosedDays((prev) =>
        [...prev, created].sort((a, b) => a.date.localeCompare(b.date))
      );
      setNewDate("");
      setNewReason("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "追加に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(day: ClosedDay) {
    if (!day.id) return;
    try {
      await deleteClosedDay(day.id);
      setClosedDays((prev) => prev.filter((d) => d.id !== day.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  }

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-text-muted">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">設定</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>

      {/* 臨時休業日管理 */}
      <Card>
        <h2 className="font-bold text-lg mb-4">臨時休業日管理</h2>
        <p className="text-sm text-text-muted mb-4">
          設定した日付は来場連絡フォーム・貸し切りフォームのカレンダーで選択不可になります。
        </p>

        {/* 追加フォーム */}
        <div className="flex flex-wrap items-end gap-3 mb-6 pb-6 border-b border-secondary/10">
          <div className="w-48">
            <Input
              label="休業日"
              type="date"
              min={today}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              label="理由（任意）"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="例：設備メンテナンス"
            />
          </div>
          <Button onClick={handleAdd} disabled={!newDate || saving} size="md">
            {saving ? "追加中..." : "追加"}
          </Button>
        </div>

        {/* 休業日一覧 */}
        {closedDays.length === 0 ? (
          <p className="text-text-muted text-sm">
            設定された臨時休業日はありません
          </p>
        ) : (
          <div className="space-y-2">
            {closedDays.map((day) => (
              <div
                key={day.id ?? day.date}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-dark"
              >
                <div>
                  <span className="font-medium">{formatDate(day.date)}</span>
                  {day.reason && (
                    <span className="text-sm text-text-muted ml-3">
                      {day.reason}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemove(day)}
                >
                  削除
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
