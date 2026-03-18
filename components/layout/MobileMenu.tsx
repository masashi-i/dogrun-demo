"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  // パス変更時に閉じる
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // スクロールロック
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* スライドパネル */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* 閉じるボタン */}
        <div className="flex items-center justify-between p-4 border-b border-secondary/10">
          <span className="font-bold text-primary">メニュー</span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-primary/5"
            aria-label="メニューを閉じる"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ナビリンク */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-primary/5 hover:text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTAボタン */}
        <div className="p-4 space-y-3 border-t border-secondary/10">
          <Link
            href="/reserve"
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors min-h-[44px]"
          >
            来場連絡はこちら
          </Link>
          <Link
            href="/charter"
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium rounded-lg bg-secondary text-white hover:bg-secondary-dark transition-colors min-h-[44px]"
          >
            貸し切り予約はこちら
          </Link>
        </div>
      </div>
    </>
  );
}
