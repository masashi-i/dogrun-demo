import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { BUSINESS_HOURS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "アクセス",
  description: "零ちゃっちゃファームDOG RUNへのアクセス方法。多治見市下沢町。駐車場あり。",
};

export default function AccessPage() {
  const phone = process.env.NEXT_PUBLIC_PHONE ?? "000-0000-0000";
  const address = process.env.NEXT_PUBLIC_ADDRESS ?? "多治見市下沢町（番地：未定）";

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-bold mb-3">所在地</h3>
                <p className="text-text-muted">{address}</p>
                <h3 className="font-bold mb-3 mt-6">電話番号</h3>
                <p>
                  <span className="hidden sm:inline text-text-muted">
                    {phone}
                  </span>
                  <a
                    href={`tel:${phone.replace(/-/g, "")}`}
                    className="sm:hidden text-primary underline"
                  >
                    {phone}
                  </a>
                </p>
              </Card>

              <Card>
                <h3 className="font-bold mb-3">営業時間</h3>
                <p className="text-text-muted">
                  {BUSINESS_HOURS.open}〜{BUSINESS_HOURS.close}
                </p>
                <p className="text-text-muted mt-1">{BUSINESS_HOURS.holiday}</p>

                <h3 className="font-bold mb-3 mt-6">駐車場</h3>
                <p className="text-text-muted">
                  無料駐車場あり（台数は現地にてご確認ください）
                </p>
              </Card>
            </div>

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
