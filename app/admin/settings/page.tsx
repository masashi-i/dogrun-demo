"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { fetchClosedDays, createClosedDay, deleteClosedDay } from "@/lib/api";
import type { ClosedDay } from "@/types";

interface Setting {
  key: string;
  value: string;
}

/** 曜日ラベル */
const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** 施設情報フィールドの定義 */
const SITE_INFO_FIELDS = [
  { key: "site_name", label: "サイト名", placeholder: "零ちゃっちゃファーム DOG RUN" },
  { key: "phone", label: "電話番号", placeholder: "000-0000-0000" },
  { key: "address", label: "住所", placeholder: "多治見市下沢町..." },
  { key: "instagram_url", label: "Instagram URL", placeholder: "https://www.instagram.com/..." },
  { key: "business_hours", label: "営業時間", placeholder: "9:00〜日没（季節により変動）" },
  { key: "latitude", label: "緯度", placeholder: "35.3328" },
  { key: "longitude", label: "経度", placeholder: "137.1167" },
] as const;

export default function AdminSettingsPage() {
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [saving, setSaving] = useState(false);

  // 全設定値（settingsテーブル）
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingField, setSavingField] = useState(false);

  // 定休日
  const [regularHolidays, setRegularHolidays] = useState<number[]>([]);
  const [savingHoliday, setSavingHoliday] = useState(false);

  // メールアドレス変更
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailPassword, setEmailPassword] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // パスワード変更
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [closedDaysData, settingsRes, holidaysRes] = await Promise.all([
          fetchClosedDays(),
          fetch("/api/settings").then((r) => r.json()),
          fetch("/api/regular-holidays").then((r) => r.json()),
        ]);
        setClosedDays(closedDaysData);

        if (Array.isArray(settingsRes)) {
          const map: Record<string, string> = {};
          settingsRes.forEach((s: Setting) => {
            map[s.key] = s.value;
          });
          setSettings(map);
        }

        if (Array.isArray(holidaysRes)) {
          setRegularHolidays(holidaysRes.map((h: { day_of_week: number }) => h.day_of_week));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- 設定値の保存 ---

  function handleStartEdit(key: string) {
    setEditingField(key);
    setEditValue(settings[key] ?? "");
  }

  async function handleSaveField(key: string) {
    setSavingField(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: editValue }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "保存に失敗しました");
      }
      setSettings((prev) => ({ ...prev, [key]: editValue }));
      setEditingField(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSavingField(false);
    }
  }

  // --- 定休日 ---

  async function handleToggleHoliday(dayOfWeek: number) {
    setSavingHoliday(true);
    const isCurrentlyHoliday = regularHolidays.includes(dayOfWeek);

    try {
      if (isCurrentlyHoliday) {
        const res = await fetch(`/api/regular-holidays?day_of_week=${dayOfWeek}`, { method: "DELETE" });
        if (!res.ok) throw new Error("削除に失敗しました");
        setRegularHolidays((prev) => prev.filter((d) => d !== dayOfWeek));
      } else {
        const res = await fetch("/api/regular-holidays", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day_of_week: dayOfWeek }),
        });
        if (!res.ok) throw new Error("追加に失敗しました");
        setRegularHolidays((prev) => [...prev, dayOfWeek].sort());
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "定休日の変更に失敗しました");
    } finally {
      setSavingHoliday(false);
    }
  }

  // --- メールアドレス変更 ---

  async function handleChangeEmail() {
    setEmailError("");
    setEmailSuccess("");

    if (!newAdminEmail || !emailPassword) return;

    setSavingEmail(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_email", currentPassword: emailPassword, newEmail: newAdminEmail }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "メールアドレスの変更に失敗しました");
      }
      setSettings((prev) => ({ ...prev, admin_email: newAdminEmail }));
      setEmailSuccess("メールアドレスを変更しました");
      setEmailPassword("");
      setNewAdminEmail("");
      setShowEmailForm(false);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "メールアドレスの変更に失敗しました");
    } finally {
      setSavingEmail(false);
    }
  }

  // --- パスワード変更 ---

  async function handleChangePassword() {
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 4) {
      setPasswordError("パスワードは4文字以上にしてください");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("新しいパスワードが一致しません");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", currentPassword, newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "パスワードの変更に失敗しました");
      }
      setPasswordSuccess("パスワードを変更しました");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "パスワードの変更に失敗しました");
    } finally {
      setSavingPassword(false);
    }
  }

  // --- 臨時休業日 ---

  async function handleAdd() {
    if (!newDate) return;
    if (closedDays.some((d) => d.date === newDate)) return;

    setSaving(true);
    try {
      const created = await createClosedDay({
        date: newDate,
        reason: newReason || undefined,
      });
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
    <div className="space-y-3">
      <h1 className="text-xl font-bold">設定</h1>

      {/* 施設情報 */}
      <Card className="p-4">
        <h2 className="font-bold text-sm mb-2">施設情報</h2>
        <div className="space-y-1">
          {SITE_INFO_FIELDS.map((field) => (
            <div key={field.key}>
              {editingField === field.key ? (
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      label={field.label}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={field.placeholder}
                    />
                  </div>
                  <Button
                    onClick={() => handleSaveField(field.key)}
                    disabled={savingField}
                    size="sm"
                  >
                    {savingField ? "保存中..." : "保存"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingField(null)}
                  >
                    キャンセル
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between py-1.5 px-2 rounded bg-surface-dark">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-text-muted">{field.label}</span>
                    <p className="text-sm truncate">
                      {settings[field.key] || (
                        <span className="text-text-muted">未設定</span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 shrink-0"
                    onClick={() => handleStartEdit(field.key)}
                  >
                    編集
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 通知先メールアドレス */}
      <Card className="p-4">
        <h2 className="font-bold text-sm mb-2">通知先メールアドレス</h2>
        {editingField === "notification_email" ? (
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="メールアドレス"
                type="email"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="example@email.com"
              />
            </div>
            <Button
              onClick={() => handleSaveField("notification_email")}
              disabled={!editValue || savingField}
              size="sm"
            >
              {savingField ? "保存中..." : "保存"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingField(null)}
            >
              キャンセル
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between py-1.5 px-2 rounded bg-surface-dark">
            <span className="text-sm">
              {settings["notification_email"] || (
                <span className="text-text-muted">未設定</span>
              )}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartEdit("notification_email")}
            >
              編集
            </Button>
          </div>
        )}
      </Card>

      {/* 管理者メールアドレス */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-sm">管理者メールアドレス</h2>
          {!showEmailForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowEmailForm(true);
                setEmailError("");
                setEmailSuccess("");
                setNewAdminEmail(settings["admin_email"] ?? "");
              }}
            >
              変更
            </Button>
          )}
        </div>

        {emailSuccess && (
          <div className="rounded bg-green-50 border border-green-200 p-2 text-sm text-green-700 mb-2">
            {emailSuccess}
          </div>
        )}

        {showEmailForm ? (
          <div className="space-y-3">
            <Input
              label="新しいメールアドレス"
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
            <Input
              label="現在のパスワード（確認用）"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {emailError && (
              <div className="rounded bg-red-50 border border-red-200 p-2 text-sm text-red-700">
                {emailError}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleChangeEmail}
                disabled={!newAdminEmail || !emailPassword || savingEmail}
                size="sm"
              >
                {savingEmail ? "変更中..." : "メールアドレスを変更"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEmailForm(false);
                  setEmailPassword("");
                  setNewAdminEmail("");
                  setEmailError("");
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between py-1.5 px-2 rounded bg-surface-dark">
            <span className="text-sm">
              {settings["admin_email"] || (
                <span className="text-text-muted">未設定</span>
              )}
            </span>
          </div>
        )}
      </Card>

      {/* パスワード変更 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-sm">管理者パスワード</h2>
          {!showPasswordForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordError("");
                setPasswordSuccess("");
              }}
            >
              変更
            </Button>
          )}
        </div>

        {passwordSuccess && (
          <div className="rounded bg-green-50 border border-green-200 p-2 text-sm text-green-700 mb-2">
            {passwordSuccess}
          </div>
        )}

        {showPasswordForm && (
          <div className="space-y-3">
            <Input
              label="現在のパスワード"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Input
              label="新しいパスワード（4文字以上）"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Input
              label="新しいパスワード（確認）"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            {passwordError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {passwordError}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword || savingPassword}
                size="sm"
              >
                {savingPassword ? "変更中..." : "パスワードを変更"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}

        {!showPasswordForm && !passwordSuccess && (
          <p className="text-sm text-text-muted">
            管理画面のログインパスワードを変更できます。
          </p>
        )}
      </Card>

      {/* 定休日設定 */}
      <Card className="p-4">
        <h2 className="font-bold text-sm mb-2">定休日設定</h2>
        <div className="flex flex-wrap gap-2">
          {DAY_LABELS.map((label, index) => (
            <button
              key={index}
              type="button"
              disabled={savingHoliday}
              onClick={() => handleToggleHoliday(index)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 text-xs font-bold transition-colors ${
                regularHolidays.includes(index)
                  ? "bg-red-100 border-red-400 text-red-700"
                  : "bg-surface-dark border-secondary/20 text-text-muted hover:border-primary/50"
              } ${savingHoliday ? "opacity-50" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
        {regularHolidays.length > 0 && (
          <p className="text-xs text-text-muted mt-2">
            定休日: 毎週{regularHolidays.map((d) => DAY_LABELS[d]).join("・")}曜日
          </p>
        )}
      </Card>

      {/* 臨時休業日管理 */}
      <Card className="p-4">
        <h2 className="font-bold text-sm mb-2">臨時休業日管理</h2>

        {/* 追加フォーム */}
        <div className="flex flex-wrap items-end gap-2 mb-4 pb-4 border-b border-secondary/10">
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
