import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { CANCEL_POLICY, BUSINESS_HOURS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "料金案内",
  description:
    "零ちゃっちゃファームDOG RUNの利用料金。平日800円〜、土日祝1,000円〜。貸し切りプランもあります。",
};

export default function PricePage() {
  return (
    <>
      <section className="bg-primary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">料金案内</h1>
          <p className="mt-2 text-white/80">Price</p>
        </Container>
      </section>

      {/* 通常利用料金 */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionTitle>通常利用料金</SectionTitle>
          <div className="max-w-3xl mx-auto">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary/20">
                      <th className="py-3 px-4 text-left font-medium text-text-muted">
                        区分
                      </th>
                      <th className="py-3 px-4 text-right font-medium text-text-muted">
                        基本料金（1人＋1頭）
                      </th>
                      <th className="py-3 px-4 text-right font-medium text-text-muted">
                        追加（1人 or 1頭ごと）
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-secondary/10">
                      <td className="py-3 px-4 font-medium">平日</td>
                      <td className="py-3 px-4 text-right text-lg font-bold text-primary">
                        800円
                      </td>
                      <td className="py-3 px-4 text-right">＋300円</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">土日祝</td>
                      <td className="py-3 px-4 text-right text-lg font-bold text-primary">
                        1,000円
                      </td>
                      <td className="py-3 px-4 text-right">＋400円</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-1 text-sm text-text-muted">
                <p>※ 当日現金払いとなります</p>
                <p>※ キャンセル料はかかりません</p>
              </div>
            </Card>

            <div className="mt-4 text-center">
              <Link
                href="/reserve"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors min-h-[48px]"
              >
                来場連絡はこちら
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 貸し切り料金 */}
      <section className="py-16 lg:py-20 bg-surface-dark">
        <Container>
          <SectionTitle>貸し切り料金</SectionTitle>
          <div className="max-w-3xl mx-auto">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary/20">
                      <th className="py-3 px-4 text-left font-medium text-text-muted">
                        時間
                      </th>
                      <th className="py-3 px-4 text-right font-medium text-text-muted">
                        貸し切り料金
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-secondary/10">
                      <td className="py-3 px-4 font-medium">2時間</td>
                      <td className="py-3 px-4 text-right text-lg font-bold text-primary">
                        5,000円
                      </td>
                    </tr>
                    <tr className="border-b border-secondary/10">
                      <td className="py-3 px-4 font-medium">3時間</td>
                      <td className="py-3 px-4 text-right text-lg font-bold text-primary">
                        6,500円
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">
                        4時間目以降（1時間ごと）
                      </td>
                      <td className="py-3 px-4 text-right text-lg font-bold text-primary">
                        ＋1,000円
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-1 text-sm text-text-muted">
                <p>※ 利用料金（人数・頭数分）は別途当日現金払いとなります</p>
                <p>※ 貸し切り中は一般のお客様はご利用いただけません</p>
              </div>
            </Card>

            <div className="mt-4 text-center">
              <Link
                href="/charter"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary text-white font-medium hover:bg-secondary-dark transition-colors min-h-[48px]"
              >
                貸し切り予約はこちら
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* キャンセルポリシー */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionTitle>キャンセルポリシー（貸し切り予約）</SectionTitle>
          <div className="max-w-3xl mx-auto">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary/20">
                      <th className="py-3 px-4 text-left font-medium text-text-muted">
                        タイミング
                      </th>
                      <th className="py-3 px-4 text-right font-medium text-text-muted">
                        キャンセル料
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {CANCEL_POLICY.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          i < CANCEL_POLICY.length - 1
                            ? "border-b border-secondary/10"
                            : ""
                        }
                      >
                        <td className="py-3 px-4 font-medium">{row.timing}</td>
                        <td className="py-3 px-4 text-right">{row.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-text-muted">
                ※ キャンセルのご連絡はお電話にてお願いいたします
                <br />※ 2026年1月1日改訂
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* 営業時間・ご利用条件 */}
      <section className="py-16 lg:py-20 bg-surface-dark">
        <Container>
          <SectionTitle>営業時間・ご利用条件</SectionTitle>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-bold mb-3">営業時間</h3>
              <p className="text-text-muted">
                {BUSINESS_HOURS.open}〜{BUSINESS_HOURS.close}
              </p>
              <p className="text-text-muted mt-1">{BUSINESS_HOURS.holiday}</p>
            </Card>
            <Card>
              <h3 className="font-bold mb-3">ワクチン接種について</h3>
              <p className="text-text-muted">
                ご来場の際は、以下の証明書（1年以内）をご持参ください。
              </p>
              <ul className="mt-2 space-y-1 text-sm text-text-muted">
                <li>・混合ワクチン接種証明書</li>
                <li>・狂犬病予防接種証明書</li>
              </ul>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
