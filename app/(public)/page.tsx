import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { HeroSlideshow } from "@/components/ui/HeroSlideshow";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

interface DbNewsRow {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
}

export const revalidate = 60; // 60秒ごとに再検証

export default async function HomePage() {
  let latestNews: { id: string; title: string; publishedAt: string }[] = [];
  try {
    const { data } = await supabase
      .from("news")
      .select("id, title, published, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);
    if (data) {
      latestNews = (data as DbNewsRow[]).map((n) => ({
        id: n.id,
        title: n.title,
        publishedAt: n.created_at.split("T")[0],
      }));
    }
  } catch {
    // フォールバック：お知らせが取得できなくてもページは表示
  }

  return (
    <>
      {/* ヒーローセクション（スライドショー背景） */}
      <section className="relative text-white overflow-hidden">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <Container className="relative py-24 lg:py-40 text-center">
          <p className="text-lg lg:text-xl mb-2 text-white/90">
            多治見市の広大なドッグラン
          </p>
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">
            零ちゃっちゃファーム
            <br className="sm:hidden" />
            DOG RUN
          </h1>
          <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            2,000㎡の人工芝フィールドで
            <br className="sm:hidden" />
            愛犬と思いっきり走ろう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reserve"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-primary font-bold hover:bg-surface transition-colors min-h-[48px] text-lg"
            >
              来場連絡はこちら
            </Link>
            <Link
              href="/charter"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-secondary text-white font-bold hover:bg-secondary-dark transition-colors min-h-[48px] text-lg"
            >
              貸し切り予約はこちら
            </Link>
          </div>
        </Container>
      </section>

      {/* 来場予定チェック（スマホで最初に見える位置） */}
      <section className="py-10 lg:py-12 bg-white border-b border-secondary/10">
        <Container>
          <Link
            href="/reserve/list"
            className="flex items-center gap-4 p-4 lg:p-6 rounded-xl bg-accent/15 border border-accent/30 hover:bg-accent/25 transition-colors max-w-3xl mx-auto"
          >
            <span className="text-3xl lg:text-4xl shrink-0">📋</span>
            <div className="flex-1">
              <h2 className="font-bold text-lg">今日の来場予定を確認する</h2>
              <p className="text-sm text-text-muted mt-0.5">
                どの時間にどんなワンちゃんが来るか事前にチェックできます
              </p>
            </div>
            <svg
              className="w-5 h-5 text-text-muted shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        </Container>
      </section>

      {/* 施設ハイライト */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionTitle sub="Zero Chaccha Farm DOG RUN">
            3つの魅力
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center overflow-hidden p-0">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1600606704395-55bb56859122?w=600&q=80"
                  alt="ボーダーコリーが芝生フィールドをジャンプ"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">2,000㎡の人工芝</h3>
                <p className="text-sm text-text-muted">
                  広大な人工芝フィールドで、大型犬も全力疾走できます。天候を気にせず快適に遊べる環境です。
                </p>
              </div>
            </Card>
            <Card className="text-center overflow-hidden p-0">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&q=80"
                  alt="様々な犬種の犬たち"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">全犬種対応</h3>
                <p className="text-sm text-text-muted">
                  小型犬から大型犬まで、すべての犬種をお迎えします。みんなで一緒に楽しく遊びましょう。
                </p>
              </div>
            </Card>
            <Card className="text-center overflow-hidden p-0">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80"
                  alt="犬と飼い主のふれあい"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">専門スタッフ在籍</h3>
                <p className="text-sm text-text-muted">
                  犬の訓練士、犬護舎流マッサージ技術者、ディスクドッグチャンピオンが在籍しています。
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* サービス紹介 */}
      <section className="py-16 lg:py-20 bg-surface-dark">
        <Container>
          <SectionTitle sub="専門スタッフによるサービス">
            サービス
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                src: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=600&q=80",
                alt: "犬のマッサージ",
                title: "犬護舎流マッサージ",
                desc: "専門技術者による犬のマッサージ。愛犬のリラクゼーションに。",
              },
              {
                src: "https://images.unsplash.com/photo-1587559070757-f72a388edbba?w=600&q=80",
                alt: "犬のトレーニング",
                title: "訓練士カウンセリング",
                desc: "しつけのお悩み相談。プロの訓練士がアドバイスします。",
              },
              {
                src: "https://images.unsplash.com/photo-1647967217953-ee30c04bd5e5?w=600&q=80",
                alt: "ボーダーコリーのディスクドッグ",
                title: "ディスクドッグ体験",
                desc: "チャンピオンによるディスクドッグ体験。初心者も大歓迎！",
              },
            ].map((s) => (
              <Card key={s.title} className="text-center overflow-hidden p-0">
                <div className="relative h-44">
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-text-muted mb-4">{s.desc}</p>
                  <Link
                    href="/contact"
                    className="text-sm text-primary font-medium hover:text-primary-dark"
                  >
                    お問い合わせ &rarr;
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* お知らせ */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionTitle>お知らせ</SectionTitle>
          <div className="max-w-2xl mx-auto space-y-4">
            {latestNews.map((news) => (
              <Link
                key={news.id}
                href={`/news/${news.id}`}
                className="block p-4 rounded-lg bg-white border border-secondary/10 hover:border-primary/30 transition-colors"
              >
                <time className="text-sm text-text-muted">
                  {formatDate(news.publishedAt)}
                </time>
                <p className="font-medium mt-1">{news.title}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/news"
              className="text-primary font-medium hover:text-primary-dark"
            >
              お知らせ一覧を見る &rarr;
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA（写真背景） */}
      <section className="relative py-20 lg:py-24 text-white text-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1633707879430-1ca365fb1f6d?w=1600&q=80"
          alt="ボーダーコリーがフリスビーにジャンプ"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/80" />
        <Container className="relative">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            愛犬と一緒に遊びに来ませんか？
          </h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            キャンセル料はかかりません。お気軽にご連絡ください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reserve"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-primary font-bold hover:bg-surface transition-colors min-h-[48px]"
            >
              来場連絡はこちら
            </Link>
            <Link
              href="/charter"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-white text-white font-bold hover:bg-white/10 transition-colors min-h-[48px]"
            >
              貸し切り予約はこちら
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
