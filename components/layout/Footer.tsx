"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";

interface SiteInfo {
  siteName: string;
  phone: string;
  address: string;
  instagramUrl: string;
  businessHours: string;
}

const DEFAULT_SITE_INFO: SiteInfo = {
  siteName: "零ちゃっちゃファーム DOG RUN",
  phone: "",
  address: "",
  instagramUrl: "#",
  businessHours: "",
};

/** settingsテーブルのkey → SiteInfoフィールドの対応 */
const KEY_MAP: Record<string, keyof SiteInfo> = {
  site_name: "siteName",
  phone: "phone",
  address: "address",
  instagram_url: "instagramUrl",
  business_hours: "businessHours",
};

/** Instagram URLからアカウント名を抽出（例: https://www.instagram.com/foo/ → @foo） */
function extractInstagramHandle(url: string): string {
  const match = url.match(/instagram\.com\/([^/?]+)/);
  return match ? `@${match[1]}` : "";
}

export function Footer() {
  const [info, setInfo] = useState<SiteInfo>(DEFAULT_SITE_INFO);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const updated = { ...DEFAULT_SITE_INFO };
        for (const row of data) {
          const field = KEY_MAP[row.key];
          if (field && row.value) {
            updated[field] = row.value;
          }
        }
        setInfo(updated);
      } catch {
        // フォールバック：デフォルト値のまま表示
      }
    }
    loadSettings();
  }, []);

  return (
    <footer className="bg-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 施設情報 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐕</span>
              <span className="text-lg font-bold">{info.siteName}</span>
            </div>
            {info.address && (
              <p className="text-sm text-white/80 mb-2">{info.address}</p>
            )}
            {info.phone && (
              <p className="text-sm text-white/80 mb-2">
                <span className="hidden sm:inline">TEL: {info.phone}</span>
                <a
                  href={`tel:${info.phone.replace(/-/g, "")}`}
                  className="sm:hidden underline"
                >
                  TEL: {info.phone}
                </a>
              </p>
            )}
            {info.businessHours && (
              <p className="text-sm text-white/80">
                営業時間: {info.businessHours}
              </p>
            )}
            <p className="text-sm text-white/80">年中無休（不定休はお知らせで告知）</p>
          </div>

          {/* ナビゲーション */}
          <div>
            <h3 className="font-bold mb-4">ページ一覧</h3>
            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-white/80 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* SNS・予約 */}
          <div>
            <h3 className="font-bold mb-4">ご予約・SNS</h3>
            <div className="space-y-3">
              <Link
                href="/reserve"
                className="block text-sm text-white/80 hover:text-white transition-colors"
              >
                来場連絡はこちら
              </Link>
              <Link
                href="/charter"
                className="block text-sm text-white/80 hover:text-white transition-colors"
              >
                貸し切り予約はこちら
              </Link>
              {info.instagramUrl && info.instagramUrl !== "#" && (
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                >
                  Instagram {extractInstagramHandle(info.instagramUrl)}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-10 pt-6 border-t border-white/20 text-center">
          <p className="text-sm text-white/60">
            &copy; {new Date().getFullYear()} {info.siteName}. All
            rights reserved.
          </p>
          <Link href="/admin/login" className="text-xs text-white/30 hover:text-white/50 transition-colors mt-2 inline-block">
            管理者ログイン
          </Link>
        </div>
      </div>
    </footer>
  );
}
