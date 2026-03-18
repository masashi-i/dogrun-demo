"use client";

import { useState, useMemo, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isBefore,
  addMonths,
  subMonths,
  isWeekend,
} from "date-fns";
import { ja } from "date-fns/locale";
import { isHoliday } from "@holiday-jp/holiday_jp";
import { cn } from "@/lib/utils";
import type { Reservation, CharterReservation, News, ClosedDay } from "@/types";

const WEEKDAY_HEADERS = ["日", "月", "火", "水", "木", "金", "土"];

interface DayInfo {
  /** 来場予定の犬の合計数 */
  dogCount: number;
  /** 組数 */
  groupCount: number;
  /** 貸し切り予約あり */
  hasCharter: boolean;
  /** イベント一覧 */
  events: string[];
  /** 臨時休業 */
  isClosed: boolean;
  /** 休業理由 */
  closedReason?: string;
}

interface CalendarProps {
  reservations: Reservation[];
  charters: CharterReservation[];
  news: News[];
  closedDays: ClosedDay[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function Calendar({
  reservations,
  charters,
  news,
  closedDays,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selectedDate ? startOfMonth(selectedDate) : startOfMonth(new Date());
  });

  const today = useMemo(() => new Date(), []);

  /** 月内の全日付情報をまとめて計算 */
  const dayInfoMap = useMemo(() => {
    const map = new Map<string, DayInfo>();

    // 予約データ集計
    reservations
      .filter((r) => r.status !== "CANCELLED")
      .forEach((r) => {
        const key = r.visitDate;
        const existing = map.get(key) ?? {
          dogCount: 0,
          groupCount: 0,
          hasCharter: false,
          events: [],
          isClosed: false,
        };
        existing.dogCount += r.dogs.length;
        existing.groupCount += 1;
        map.set(key, existing);
      });

    // 貸し切りデータ集計
    charters
      .filter((c) => c.status === "CONFIRMED")
      .forEach((c) => {
        const key = c.visitDate;
        const existing = map.get(key) ?? {
          dogCount: 0,
          groupCount: 0,
          hasCharter: false,
          events: [],
          isClosed: false,
        };
        existing.hasCharter = true;
        map.set(key, existing);
      });

    // イベントデータ集計
    news
      .filter((n) => n.published && n.eventDate)
      .forEach((n) => {
        const key = n.eventDate!;
        const existing = map.get(key) ?? {
          dogCount: 0,
          groupCount: 0,
          hasCharter: false,
          events: [],
          isClosed: false,
        };
        existing.events.push(n.title);
        map.set(key, existing);
      });

    // 休業日集計
    closedDays.forEach((cd) => {
      const key = cd.date;
      const existing = map.get(key) ?? {
        dogCount: 0,
        groupCount: 0,
        hasCharter: false,
        events: [],
        isClosed: false,
      };
      existing.isClosed = true;
      existing.closedReason = cd.reason;
      map.set(key, existing);
    });

    return map;
  }, [reservations, charters, news, closedDays]);

  /** カレンダーグリッド用の日付配列 */
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const handlePrevMonth = useCallback(
    () => setCurrentMonth((m) => subMonths(m, 1)),
    []
  );
  const handleNextMonth = useCallback(
    () => setCurrentMonth((m) => addMonths(m, 1)),
    []
  );

  /** 日付がクリック可能かどうか */
  function isClickable(date: Date): boolean {
    const dateStr = format(date, "yyyy-MM-dd");
    const info = dayInfoMap.get(dateStr);
    // 過去日は選択不可
    if (isBefore(date, today) && !isSameDay(date, today)) return false;
    // 休業日は選択不可
    if (info?.isClosed) return false;
    return true;
  }

  return (
    <div className="bg-white rounded-xl border border-secondary/10 overflow-hidden">
      {/* ヘッダー: 月ナビゲーション */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary-dark text-white">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="前月"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h2 className="text-lg font-bold">
          {format(currentMonth, "yyyy年M月", { locale: ja })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="次月"
        >
          <svg
            className="w-5 h-5"
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
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-secondary/10">
        {WEEKDAY_HEADERS.map((day, i) => (
          <div
            key={day}
            className={cn(
              "py-2 text-center text-xs font-medium",
              i === 0 && "text-red-500",
              i === 6 && "text-blue-500",
              i > 0 && i < 6 && "text-text-muted"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const info = dayInfoMap.get(dateStr);
          const inMonth = isSameMonth(date, currentMonth);
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isPast = isBefore(date, today) && !isToday;
          const isHol = isHoliday(date) && !isWeekend(date);
          const dayOfWeek = date.getDay();
          const clickable = isClickable(date);

          return (
            <button
              key={dateStr}
              onClick={() => clickable && onSelectDate(date)}
              disabled={!clickable || !inMonth}
              className={cn(
                "relative flex flex-col items-start p-1.5 sm:p-2 min-h-[72px] sm:min-h-[90px] border-t border-r border-secondary/10 text-left transition-colors",
                // 当月外
                !inMonth && "bg-gray-50 opacity-40",
                // 過去日
                inMonth && isPast && "bg-gray-50 opacity-50",
                // 土日祝の背景
                inMonth &&
                  !isPast &&
                  (dayOfWeek === 0 || dayOfWeek === 6 || isHol) &&
                  "bg-red-50/50",
                // 選択中
                isSelected && "ring-2 ring-inset ring-primary bg-primary/5",
                // クリック可能
                inMonth && clickable && !isPast && "hover:bg-primary/5 cursor-pointer",
                // クリック不可（休業日）
                inMonth && !clickable && !isPast && "cursor-not-allowed",
                // 休業日
                info?.isClosed && inMonth && "bg-gray-100"
              )}
            >
              {/* 日付数字 */}
              <span
                className={cn(
                  "text-sm font-medium leading-none",
                  dayOfWeek === 0 && "text-red-500",
                  dayOfWeek === 6 && "text-blue-500",
                  isHol && "text-red-500",
                  isToday &&
                    "bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                )}
              >
                {format(date, "d")}
              </span>

              {/* インジケーター群 */}
              {inMonth && !isPast && info && (
                <div className="mt-1 flex flex-col gap-0.5 w-full overflow-hidden">
                  {/* 休業日 */}
                  {info.isClosed && (
                    <span className="text-[10px] sm:text-xs truncate text-gray-500">
                      <span className="hidden sm:inline">🚫 休業</span>
                      <span className="sm:hidden">🚫</span>
                    </span>
                  )}
                  {/* 貸し切り */}
                  {info.hasCharter && (
                    <span className="text-[10px] sm:text-xs truncate text-secondary-dark">
                      <span className="hidden sm:inline">🔒 貸切あり</span>
                      <span className="sm:hidden">🔒</span>
                    </span>
                  )}
                  {/* 来場予定 */}
                  {info.dogCount > 0 && (
                    <span className="text-[10px] sm:text-xs truncate text-primary-dark">
                      <span className="hidden sm:inline">
                        📋 {info.groupCount}組{info.dogCount}頭
                      </span>
                      <span className="sm:hidden">📋{info.dogCount}</span>
                    </span>
                  )}
                  {/* イベント */}
                  {info.events.map((ev, i) => (
                    <span
                      key={i}
                      className="text-[10px] sm:text-xs truncate text-accent-dark"
                    >
                      <span className="hidden sm:inline">🎉 {ev}</span>
                      <span className="sm:hidden">🎉</span>
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-3 px-4 py-3 border-t border-secondary/10 bg-surface text-xs text-text-muted">
        <span>📋 来場予定</span>
        <span>🔒 貸し切り</span>
        <span>🎉 イベント</span>
        <span>🚫 休業</span>
        <span className="text-red-500">● 日祝</span>
        <span className="text-blue-500">● 土</span>
      </div>
    </div>
  );
}
