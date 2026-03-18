"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { fetchNews } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { News } from "@/types";

export default function NewsDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const allNews = await fetchNews(true);
        const found = allNews.find((n) => n.id === id);
        if (found) {
          setNews(found);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

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
          <div className="max-w-3xl mx-auto">
            {loading ? (
              <p className="text-center text-text-muted py-12">読み込み中...</p>
            ) : notFound || !news ? (
              <Card className="text-center py-12">
                <p className="text-text-muted">お知らせが見つかりません。</p>
                <div className="mt-4">
                  <Link
                    href="/news"
                    className="text-primary font-medium hover:text-primary-dark"
                  >
                    &larr; お知らせ一覧に戻る
                  </Link>
                </div>
              </Card>
            ) : (
              <>
                <Card>
                  <time className="text-sm text-text-muted">
                    {formatDate(news.publishedAt)}
                  </time>
                  <h2 className="text-xl lg:text-2xl font-bold mt-2 mb-6">
                    {news.title}
                  </h2>
                  {news.body && (
                    <div className="text-text leading-relaxed whitespace-pre-wrap">
                      {news.body}
                    </div>
                  )}
                </Card>

                <div className="mt-6 text-center">
                  <Link
                    href="/news"
                    className="text-primary font-medium hover:text-primary-dark"
                  >
                    &larr; お知らせ一覧に戻る
                  </Link>
                </div>
              </>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
