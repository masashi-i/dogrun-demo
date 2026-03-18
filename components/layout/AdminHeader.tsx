"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-secondary/10">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {/* モバイルメニューボタン */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-primary/5"
            aria-label="管理メニュー"
          >
            <svg
              className="w-5 h-5 text-text"
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
          <span className="font-bold text-primary">管理画面</span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-text-muted hover:text-primary hidden sm:block">
            サイトに戻る
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-sm text-text-muted hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* モバイル用ナビ */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-secondary/10 px-3 py-2 space-y-1">
          <Link
            href="/"
            className="block px-4 py-2 text-sm text-text-muted hover:text-primary"
            onClick={() => setMenuOpen(false)}
          >
            &larr; サイトに戻る
          </Link>
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-4 py-2 rounded-lg text-sm font-medium",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-primary/5"
              )}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
