"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-secondary/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐕</span>
            <span className="text-lg font-bold text-primary">
              零ちゃっちゃファーム
            </span>
          </Link>

          {/* PCナビゲーション */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + ハンバーガー */}
          <div className="flex items-center gap-2">
            <Link
              href="/reserve"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              来場連絡
            </Link>
            <Link
              href="/charter"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-white hover:bg-secondary-dark transition-colors"
            >
              貸し切り予約
            </Link>

            {/* ハンバーガーボタン */}
            <button
              onClick={() => setMenuOpen(true)}
              className={cn(
                "lg:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-primary/5 transition-colors"
              )}
              aria-label="メニューを開く"
            >
              <svg
                className="w-6 h-6 text-text"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </header>
  );
}
