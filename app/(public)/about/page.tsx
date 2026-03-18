import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "施設紹介",
  description:
    "零ちゃっちゃファームは多治見市にある2,000㎡の人工芝ドッグラン。全犬種対応で大型犬も全力疾走できます。",
};

export default function AboutPage() {
  return (
    <>
      {/* ページヘッダー */}
      <section className="bg-primary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">施設紹介</h1>
          <p className="mt-2 text-white/80">About Our Facility</p>
        </Container>
      </section>

      {/* コンセプト */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionTitle>コンセプト</SectionTitle>
          <div className="max-w-3xl mx-auto">
            <Card>
              <p className="text-text leading-relaxed">
                零ちゃっちゃファームは、「愛犬と飼い主が自然の中でのびのびと過ごせる場所」をコンセプトに生まれたドッグランです。
              </p>
              <p className="text-text leading-relaxed mt-4">
                多治見市下沢町に位置する2,000㎡の広大な人工芝フィールドでは、小型犬から大型犬まで、すべての犬種が思いっきり走り回ることができます。
              </p>
              <p className="text-text leading-relaxed mt-4">
                犬の訓練士、犬護舎流マッサージ技術者、ディスクドッグチャンピオンなどの専門スタッフが在籍しており、愛犬との暮らしをトータルでサポートします。
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* 施設の特徴 */}
      <section className="py-16 lg:py-20 bg-surface-dark">
        <Container>
          <SectionTitle>施設の特徴</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: "🌿",
                title: "2,000㎡の人工芝",
                desc: "広大な人工芝フィールドは、雨上がりでもぬかるまず快適。大型犬が全力で走れる十分な広さです。",
              },
              {
                icon: "🐕",
                title: "全犬種対応",
                desc: "チワワからグレートデンまで、すべての犬種を歓迎。サイズによるエリア分けはなく、みんなで一緒に遊べます。",
              },
              {
                icon: "🏃",
                title: "大型犬も全力疾走OK",
                desc: "十分な広さがあるため、大型犬やサイトハウンドなどの走る犬種も思いっきり走れます。",
              },
              {
                icon: "💧",
                title: "水飲み場・日よけ完備",
                desc: "水分補給のための水飲み場や、暑い季節の日よけスペースもご用意しています。",
              },
            ].map((item) => (
              <Card key={item.title}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-text-muted">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* スタッフ紹介 */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionTitle>スタッフ紹介</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: "🎓",
                title: "犬の訓練士",
                desc: "しつけの悩みやトレーニングのアドバイスを行います。お気軽にご相談ください。",
              },
              {
                icon: "💆",
                title: "犬護舎流マッサージ技術者",
                desc: "予約制の犬専門マッサージ。愛犬の健康維持とリラクゼーションをサポートします。",
              },
              {
                icon: "🥏",
                title: "ディスクドッグチャンピオン",
                desc: "ディスクドッグの技術を丁寧に指導。初めてのワンちゃんでも楽しめます。",
              },
            ].map((staff) => (
              <Card key={staff.title} className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-4">
                  {staff.icon}
                </div>
                <h3 className="font-bold mb-2">{staff.title}</h3>
                <p className="text-sm text-text-muted">{staff.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 囲いの注意事項 */}
      <section className="py-16 lg:py-20 bg-surface-dark">
        <Container>
          <div className="max-w-3xl mx-auto">
            <Card className="border-l-4 border-l-accent">
              <h3 className="font-bold text-lg mb-2">
                囲いについてのご案内
              </h3>
              <p className="text-text-muted leading-relaxed">
                当施設の囲いは手作りのものです。ご利用前に現地で囲いの状態をご確認いただくことをお勧めいたします。小型犬や脱走が心配なワンちゃんをお連れの場合は、特にご注意ください。
              </p>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
