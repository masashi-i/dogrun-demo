"use client";

import { useState, useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";

interface SiteInfo {
  phone: string;
  address: string;
  businessHours: string;
  latitude: string;
  longitude: string;
}

const KEY_MAP: Record<string, keyof SiteInfo> = {
  phone: "phone",
  address: "address",
  business_hours: "businessHours",
  latitude: "latitude",
  longitude: "longitude",
};

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export default function AccessPage() {
  const [info, setInfo] = useState<SiteInfo>({
    phone: "",
    address: "",
    businessHours: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(true);

  // 地図URLを一度だけ確定させるためのref
  const mapSrcRef = useRef<string | null>(null);
  const [mapSrc, setMapSrc] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const updated: SiteInfo = { phone: "", address: "", businessHours: "", latitude: "", longitude: "" };
        for (const row of data) {
          const field = KEY_MAP[row.key];
          if (field && row.value) {
            updated[field] = row.value;
          }
        }
        setInfo(updated);

        // 地図URLを一度だけセット（refで重複防止）
        if (!mapSrcRef.current && updated.latitude && updated.longitude && apiKey) {
          const src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${updated.latitude},${updated.longitude}&zoom=15`;
          mapSrcRef.current = src;
          setMapSrc(src);
        }
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
            {/* Google Maps */}
            {mapSrc ? (
              <div className="w-full h-72 lg:h-96 rounded-xl overflow-hidden border border-secondary/20">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapSrc}
                  allowFullScreen
                  title="施設の地図"
                />
              </div>
            ) : !loading ? (
              <div className="w-full h-72 lg:h-96 rounded-xl bg-surface-dark border border-secondary/20 flex items-center justify-center">
                <div className="text-center text-text-muted">
                  <p className="text-4xl mb-2">📍</p>
                  <p className="font-medium">Google Maps</p>
                  <p className="text-sm">位置情報の設定後に表示されます</p>
                </div>
              </div>
            ) : null}

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
