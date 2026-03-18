"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { fetchNews } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { News } from "@/types";

export default function NewsListPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchNews(true);
        setNewsList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <section className="bg-primary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">お知らせ</h1>
          <p className="mt-2 text-white/80">News</p>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <div className="max-w-3xl mx-auto space-y-4">
            {loading ? (
              <p className="text-center text-text-muted py-12">読み込み中...</p>
            ) : error ? (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 text-center">
                {error}
              </div>
            ) : newsList.length === 0 ? (
              <p className="text-center text-text-muted py-12">
                お知らせはまだありません。
              </p>
            ) : (
              newsList.map((news) => (
                <Link
                  key={news.id}
                  href={`/news/${news.id}`}
                  className="block p-5 rounded-lg bg-white border border-secondary/10 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <time className="text-sm text-text-muted">
                    {formatDate(news.publishedAt)}
                  </time>
                  <h2 className="font-medium mt-1 text-text">
                    {news.title}
                  </h2>
                </Link>
              ))
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
