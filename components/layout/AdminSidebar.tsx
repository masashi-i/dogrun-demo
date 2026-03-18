"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-secondary/10 hidden lg:block">
      <div className="p-4">
        <Link
          href="/"
          className="text-sm text-text-muted hover:text-primary transition-colors"
        >
          &larr; サイトに戻る
        </Link>
      </div>
      <nav className="px-3 pb-4 space-y-1">
        {ADMIN_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-text-muted hover:bg-primary/5 hover:text-primary"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
