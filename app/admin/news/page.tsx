"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { fetchNews, createNews, updateNews, deleteNews } from "@/lib/api";
import type { News } from "@/types";

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await fetchNews();
      setNewsList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!editTitle) return;
    setSaving(true);
    try {
      const created = await createNews({ title: editTitle, content: editBody });
      setNewsList((prev) => [created, ...prev]);
      setCreating(false);
      setEditTitle("");
      setEditBody("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(id: string) {
    const news = newsList.find((n) => n.id === id);
    if (news) {
      setEditing(id);
      setEditTitle(news.title);
      setEditBody(news.body || "");
    }
  }

  async function handleSave(id: string) {
    setSaving(true);
    try {
      const updated = await updateNews(id, { title: editTitle, content: editBody });
      setNewsList((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
      setEditing(null);
      setEditTitle("");
      setEditBody("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(id: string) {
    const news = newsList.find((n) => n.id === id);
    if (!news) return;
    try {
      const updated = await updateNews(id, { published: !news.published });
      setNewsList((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "公開状態の変更に失敗しました");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("このお知らせを削除しますか？")) return;
    try {
      await deleteNews(id);
      setNewsList((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">お知らせ管理</h1>
        <p className="text-text-muted">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">お知らせ管理</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">お知らせ管理</h1>
        {!creating && (
          <Button
            onClick={() => {
              setCreating(true);
              setEditTitle("");
              setEditBody("");
            }}
          >
            新規作成
          </Button>
        )}
      </div>

      {/* 新規作成フォーム */}
      {creating && (
        <Card className="border-primary/30">
          <h3 className="font-bold mb-4">新規お知らせ</h3>
          <div className="space-y-4">
            <Input
              label="タイトル"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
            <Textarea
              label="本文"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={!editTitle || saving}
                size="sm"
              >
                {saving ? "作成中..." : "作成"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreating(false)}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 一覧 */}
      {newsList.map((news) => (
        <Card key={news.id}>
          {editing === news.id ? (
            <div className="space-y-4">
              <Input
                label="タイトル"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <Textarea
                label="本文"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave(news.id)}
                  disabled={saving}
                  size="sm"
                >
                  {saving ? "保存中..." : "保存"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(null)}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{news.title}</h3>
                    <Badge
                      variant={news.published ? "confirmed" : "default"}
                    >
                      {news.published ? "公開" : "非公開"}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    {formatDate(news.publishedAt)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(news.id)}
                  >
                    {news.published ? "非公開" : "公開"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(news.id)}
                  >
                    編集
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(news.id)}
                  >
                    削除
                  </Button>
                </div>
              </div>

              {news.body && (
                <p className="mt-3 text-sm text-text-muted line-clamp-3">
                  {news.body}
                </p>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
