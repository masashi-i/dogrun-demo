import Link from "next/link";
import { NAV_ITEMS, BUSINESS_HOURS } from "@/lib/constants";

export function Footer() {
  const phone = process.env.NEXT_PUBLIC_PHONE ?? "000-0000-0000";
  const address =
    process.env.NEXT_PUBLIC_ADDRESS ?? "多治見市下沢町（番地：未定）";
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM ?? "#";

  return (
    <footer className="bg-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 施設情報 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐕</span>
              <span className="text-lg font-bold">零ちゃっちゃファーム</span>
            </div>
            <p className="text-sm text-white/80 mb-2">{address}</p>
            <p className="text-sm text-white/80 mb-2">
              <span className="hidden sm:inline">TEL: {phone}</span>
              <a
                href={`tel:${phone.replace(/-/g, "")}`}
                className="sm:hidden underline"
              >
                TEL: {phone}
              </a>
            </p>
            <p className="text-sm text-white/80">
              営業時間: {BUSINESS_HOURS.open}〜{BUSINESS_HOURS.close}
            </p>
            <p className="text-sm text-white/80">{BUSINESS_HOURS.holiday}</p>
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
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                Instagram @reichaccha_farm_whippet
              </a>
            </div>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-10 pt-6 border-t border-white/20 text-center">
          <p className="text-sm text-white/60">
            &copy; {new Date().getFullYear()} 零ちゃっちゃファーム DOG RUN. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
