"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";

interface SiteInfo {
  phone: string;
  address: string;
  businessHours: string;
}

const KEY_MAP: Record<string, keyof SiteInfo> = {
  phone: "phone",
  address: "address",
  business_hours: "businessHours",
};

export default function AccessPage() {
  const [info, setInfo] = useState<SiteInfo>({
    phone: "",
    address: "",
    businessHours: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const updated: SiteInfo = { phone: "", address: "", businessHours: "" };
        for (const row of data) {
          const field = KEY_MAP[row.key];
          if (field && row.value) {
            updated[field] = row.value;
          }
        }
        setInfo(updated);
      } catch {
        // フォールバック
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  return (
    <>
      <section className="bg-primary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">アクセス</h1>
          <p className="mt-2 text-white/80">Access</p>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <SectionTitle>施設情報</SectionTitle>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Google Maps プレースホルダー */}
            <div className="w-full h-64 lg:h-96 rounded-xl bg-surface-dark border border-secondary/20 flex items-center justify-center">
              <div className="text-center text-text-muted">
                <p className="text-4xl mb-2">📍</p>
                <p className="font-medium">Google Maps</p>
                <p className="text-sm">住所確定後に埋め込み予定</p>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-text-muted">読み込み中...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="font-bold mb-3">所在地</h3>
                  <p className="text-text-muted">{info.address || "—"}</p>
                  <h3 className="font-bold mb-3 mt-6">電話番号</h3>
                  <p>
                    {info.phone ? (
                      <>
                        <span className="hidden sm:inline text-text-muted">
                          {info.phone}
                        </span>
                        <a
                          href={`tel:${info.phone.replace(/-/g, "")}`}
                          className="sm:hidden text-primary underline"
                        >
                          {info.phone}
                        </a>
                      </>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </p>
                </Card>

                <Card>
                  <h3 className="font-bold mb-3">営業時間</h3>
                  <p className="text-text-muted">
                    {info.businessHours || "—"}
                  </p>
                  <p className="text-text-muted mt-1">年中無休（不定休はお知らせで告知）</p>

                  <h3 className="font-bold mb-3 mt-6">駐車場</h3>
                  <p className="text-text-muted">
                    無料駐車場あり（台数は現地にてご確認ください）
                  </p>
                </Card>
              </div>
            )}

            {/* 交通案内 */}
            <Card>
              <h3 className="font-bold mb-3">交通案内</h3>
              <div className="space-y-3 text-text-muted">
                <div>
                  <h4 className="font-medium text-text">お車でお越しの場合</h4>
                  <p className="text-sm mt-1">
                    中央自動車道 多治見ICから約15分（詳細は住所確定後に更新）
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-text">
                    公共交通機関でお越しの場合
                  </h4>
                  <p className="text-sm mt-1">
                    JR多治見駅からタクシーで約10分（詳細は住所確定後に更新）
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
