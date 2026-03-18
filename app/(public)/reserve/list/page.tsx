"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Calendar } from "@/components/ui/Calendar";
import { Button } from "@/components/ui/Button";
import { DOG_SIZE_LABELS, DOG_GENDER_LABELS } from "@/lib/constants";
import { fetchReservations, fetchCharters, fetchNews, fetchClosedDays } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Dog, Reservation, CharterReservation, News, ClosedDay } from "@/types";

/** 営業時間枠（9:00〜17:00の1時間単位） */
const TIME_SLOTS = Array.from({ length: 9 }, (_, i) => {
  const hour = i + 9;
  return { hour, label: `${hour}:00` };
});

/** 「10時頃」等の自由テキストから時間（hour）を抽出 */
function parseVisitHour(visitTime: string): number | null {
  const match = visitTime.match(/(\d{1,2})/);
  if (!match) return null;
  const hour = parseInt(match[1], 10);
  if (hour < 9 || hour > 17) return null;
  return hour;
}

/** サイズに応じたバッジスタイル */
function sizeBadgeClass(size: string): string {
  if (size === "LARGE") return "bg-red-100 text-red-700 border-red-200";
  if (size === "MEDIUM") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
}

/** サイズに応じたアイコン */
function sizeIcon(size: string): string {
  if (size === "LARGE") return "🐕‍🦺";
  if (size === "MEDIUM") return "🐕";
  return "🐩";
}

interface SlotDog extends Dog {
  reservationIndex: number;
}

export default function ReserveListPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [allCharters, setAllCharters] = useState<CharterReservation[]>([]);
  const [allNews, setAllNews] = useState<News[]>([]);
  const [allClosedDays, setAllClosedDays] = useState<ClosedDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [reservations, charters, news, closedDays] = await Promise.all([
          fetchReservations(),
          fetchCharters(),
          fetchNews(true),
          fetchClosedDays(),
        ]);
        setAllReservations(reservations);
        setAllCharters(charters);
        setAllNews(news);
        setAllClosedDays(closedDays);
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedDateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null;

  // 選択日の来場予定（キャンセル除く）
  const reservations = useMemo(
    () =>
      allReservations.filter(
        (r) => r.visitDate === selectedDateStr && r.status !== "CANCELLED"
      ),
    [allReservations, selectedDateStr]
  );

  // 選択日の貸し切り予約（キャンセル除く）
  const charters = useMemo(
    () =>
      allCharters.filter(
        (c) => c.visitDate === selectedDateStr && c.status === "CONFIRMED"
      ),
    [allCharters, selectedDateStr]
  );

  // 選択日のイベント
  const events = useMemo(
    () =>
      allNews.filter(
        (n) => n.published && n.eventDate === selectedDateStr
      ),
    [allNews, selectedDateStr]
  );

  // 選択日の休業情報
  const closedInfo = useMemo(
    () => allClosedDays.find((cd) => cd.date === selectedDateStr),
    [allClosedDays, selectedDateStr]
  );

  // 貸し切り時間帯のセット（hour単位）
  const charterHours = useMemo(() => {
    const hours = new Set<number>();
    charters.forEach((c) => {
      const startMatch = c.startTime.match(/(\d{1,2})/);
      if (!startMatch) return;
      const start = parseInt(startMatch[1], 10);
      for (let h = start; h < start + c.hours; h++) {
        hours.add(h);
      }
    });
    return hours;
  }, [charters]);

  // 時間帯ごとの犬リストを構築
  const slotMap = useMemo(() => {
    const map = new Map<number, SlotDog[]>();
    TIME_SLOTS.forEach((s) => map.set(s.hour, []));

    reservations.forEach((r, rIdx) => {
      const hour = parseVisitHour(r.visitTime);
      if (hour === null) return;
      const list = map.get(hour);
      if (!list) return;
      r.dogs.forEach((dog) => {
        list.push({ ...dog, reservationIndex: rIdx });
      });
    });

    return map;
  }, [reservations]);

  // 全犬の合計
  const totalDogs = reservations.reduce((sum, r) => sum + r.dogs.length, 0);

  if (loading) {
    return (
      <>
        <section className="bg-primary-dark text-white py-12 lg:py-16">
          <Container className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold">来場予定カレンダー</h1>
          </Container>
        </section>
        <section className="py-16">
          <Container>
            <p className="text-center text-text-muted">読み込み中...</p>
          </Container>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className="bg-primary-dark text-white py-12 lg:py-16">
          <Container className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold">来場予定カレンダー</h1>
          </Container>
        </section>
        <section className="py-16">
          <Container>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 text-center">
              {error}
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="bg-primary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">来場予定カレンダー</h1>
          <p className="mt-2 text-white/80">
            カレンダーで予定を確認して、そのまま来場連絡ができます
          </p>
        </Container>
      </section>

      <section className="py-8 lg:py-12">
        <Container>
          <div className="max-w-5xl mx-auto space-y-8">
            {/* カレンダー */}
            <Calendar
              reservations={allReservations}
              charters={allCharters}
              news={allNews}
              closedDays={allClosedDays}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* 選択日の詳細パネル */}
            {selectedDate && selectedDateStr && (
              <div className="space-y-6">
                {/* 日付ヘッダー */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-xl font-bold">
                    {format(selectedDate, "M月d日（E）", { locale: ja })}
                    の予定
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <span>
                      {reservations.length}組 / {totalDogs}頭
                    </span>
                  </div>
                </div>

                {/* 休業日の場合 */}
                {closedInfo && (
                  <Card className="bg-gray-100 border-gray-300 text-center py-8">
                    <p className="text-lg font-medium text-gray-600">
                      🚫 この日は臨時休業です
                    </p>
                    {closedInfo.reason && (
                      <p className="mt-2 text-sm text-gray-500">
                        理由: {closedInfo.reason}
                      </p>
                    )}
                  </Card>
                )}

                {/* イベント情報 */}
                {events.length > 0 && (
                  <div className="space-y-3">
                    {events.map((ev) => (
                      <Card
                        key={ev.id}
                        className="bg-accent/10 border-accent/30"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl shrink-0">🎉</span>
                          <div>
                            <h3 className="font-bold text-sm">{ev.title}</h3>
                            {ev.body && (
                              <p className="mt-1 text-xs text-text-muted line-clamp-2">
                                {ev.body.split("\n")[0]}
                              </p>
                            )}
                            <Link
                              href={`/news/${ev.id}`}
                              className="text-xs text-primary font-medium hover:text-primary-dark mt-1 inline-block"
                            >
                              詳細を見る &rarr;
                            </Link>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* 貸し切り情報 */}
                {charters.length > 0 && (
                  <div className="space-y-3">
                    {charters.map((c) => (
                      <Card
                        key={c.id}
                        className="bg-secondary/5 border-secondary/20"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl shrink-0">🔒</span>
                          <div>
                            <h3 className="font-bold text-sm">
                              貸し切り予約あり
                            </h3>
                            <p className="text-xs text-text-muted">
                              {c.startTime}〜{parseInt(c.startTime)}
                              {c.hours}時間（一般利用不可）
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* タイムテーブル（休業日でない場合） */}
                {!closedInfo && (
                  <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-primary-dark text-white">
                            <th className="py-3 px-4 text-left font-medium w-24 whitespace-nowrap">
                              時間帯
                            </th>
                            <th className="py-3 px-4 text-center font-medium w-16">
                              頭数
                            </th>
                            <th className="py-3 px-4 text-left font-medium">
                              来場予定のワンちゃん
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {TIME_SLOTS.map((slot) => {
                            const dogs = slotMap.get(slot.hour) ?? [];
                            const isCharter = charterHours.has(slot.hour);

                            return (
                              <tr
                                key={slot.hour}
                                className={cn(
                                  "border-t border-secondary/10",
                                  isCharter && "bg-secondary/5",
                                  dogs.length > 0 &&
                                    !isCharter &&
                                    "bg-white"
                                )}
                              >
                                <td className="py-3 px-4 font-medium whitespace-nowrap align-top">
                                  {slot.label}
                                </td>
                                <td className="py-3 px-4 text-center align-top">
                                  {isCharter ? (
                                    <span className="text-secondary-dark font-medium">
                                      —
                                    </span>
                                  ) : dogs.length > 0 ? (
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold">
                                      {dogs.length}
                                    </span>
                                  ) : (
                                    <span className="text-text-muted">0</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {isCharter ? (
                                    <span className="inline-flex items-center gap-1.5 text-secondary-dark font-medium">
                                      🔒 貸し切り
                                    </span>
                                  ) : dogs.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {dogs.map((dog) => (
                                        <span
                                          key={dog.id}
                                          className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                            sizeBadgeClass(dog.size)
                                          )}
                                        >
                                          <span>{sizeIcon(dog.size)}</span>
                                          {dog.breed}
                                          <span className="opacity-60">
                                            {DOG_GENDER_LABELS[dog.gender]}
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-text-muted/50">
                                      予定なし
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* 来場連絡ボタン */}
                {!closedInfo && (
                  <div className="text-center">
                    <Link href={`/reserve?date=${selectedDateStr}`}>
                      <Button size="lg" className="min-w-[280px]">
                        {format(selectedDate, "M月d日", { locale: ja })}
                        に来場連絡する
                      </Button>
                    </Link>
                  </div>
                )}

                {/* 凡例 */}
                <div className="flex flex-wrap gap-4 justify-center text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-red-100 text-red-700 border-red-200">
                    🐕‍🦺 大型犬（25kg〜）
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-yellow-100 text-yellow-700 border-yellow-200">
                    🐕 中型犬（10〜25kg）
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-blue-100 text-blue-700 border-blue-200">
                    🐩 小型犬（〜10kg）
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-secondary/10 text-secondary-dark border-secondary/20">
                    🔒 貸し切り
                  </span>
                </div>
              </div>
            )}

            {/* 日付未選択時のガイド */}
            {!selectedDate && (
              <Card className="text-center py-12 bg-surface">
                <p className="text-lg text-text-muted">
                  カレンダーの日付をタップして
                  <br className="sm:hidden" />
                  詳細を確認しましょう
                </p>
              </Card>
            )}

            {/* 注意事項 */}
            <Card className="bg-accent/10 border-accent/30">
              <h3 className="font-medium text-sm mb-2">ご注意</h3>
              <ul className="text-sm text-text-muted space-y-1">
                <li>
                  ・来場予定は変更になる場合があります（キャンセル料はかかりません）
                </li>
                <li>
                  ・苦手な犬種がいる場合は、時間帯をずらしてのご来場をおすすめします
                </li>
                <li>
                  ・ご不安な点はお電話にてお気軽にご相談ください
                </li>
              </ul>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
