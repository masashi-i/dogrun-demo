import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "サービス紹介",
  description:
    "犬護舎流マッサージ、訓練士カウンセリング、ディスクドッグ体験など、零ちゃっちゃファームの専門サービスをご紹介。",
};

const SERVICES = [
  {
    icon: "💆",
    title: "犬護舎流マッサージ",
    tag: "予約制",
    description:
      "犬護舎流の専門マッサージ技術者が、愛犬に合わせたマッサージを行います。筋肉のこりをほぐし、血行を促進。リラクゼーション効果も高く、シニア犬のケアにもおすすめです。",
    details: [
      "完全予約制（お問い合わせフォームよりご予約）",
      "料金はお問い合わせください",
      "施術時間は犬のサイズ・状態により異なります",
    ],
  },
  {
    icon: "🎓",
    title: "犬の訓練士カウンセリング",
    tag: "予約制",
    description:
      "プロの犬の訓練士が、しつけのお悩みに個別対応します。吠え癖、引っ張り癖、他犬との接し方など、お困りのことがあればお気軽にご相談ください。",
    details: [
      "完全予約制（お問い合わせフォームよりご予約）",
      "料金はお問い合わせください",
      "カウンセリング後、トレーニングプランをご提案",
    ],
  },
  {
    icon: "🥏",
    title: "ディスクドッグ体験",
    tag: "体験可能",
    description:
      "ディスクドッグチャンピオンが丁寧に指導します。初めてのワンちゃんでも大丈夫！飼い主さんとワンちゃんの絆を深める素敵な体験です。",
    details: [
      "体験会は不定期開催（お知らせをチェック）",
      "個別指導も可能（要予約）",
      "ディスクの貸し出しあり",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="bg-primary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">サービス紹介</h1>
          <p className="mt-2 text-white/80">Our Services</p>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <SectionTitle sub="専門スタッフによるサービス">
            サービス一覧
          </SectionTitle>

          <div className="space-y-8 max-w-4xl mx-auto">
            {SERVICES.map((service) => (
              <Card key={service.title} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* アイコンエリア */}
                  <div className="flex-shrink-0 flex items-center justify-center w-full lg:w-40 h-32 lg:h-auto bg-primary/5 rounded-lg">
                    <span className="text-5xl">{service.icon}</span>
                  </div>

                  {/* 内容 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{service.title}</h3>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent/20 text-secondary-dark">
                        {service.tag}
                      </span>
                    </div>
                    <p className="text-text-muted leading-relaxed mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-1 mb-4">
                      {service.details.map((d, i) => (
                        <li
                          key={i}
                          className="text-sm text-text-muted flex items-start gap-2"
                        >
                          <span className="text-primary mt-0.5">&#9679;</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/contact"
                      className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
                    >
                      お問い合わせ・ご予約
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
