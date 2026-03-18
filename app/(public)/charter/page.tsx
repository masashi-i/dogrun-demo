import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { CharterForm } from "@/components/forms/CharterForm";

export const metadata: Metadata = {
  title: "貸し切り予約",
  description:
    "零ちゃっちゃファームDOG RUNの貸し切り予約。2時間5,000円〜。グループやイベントにご利用ください。",
};

export default function CharterPage() {
  return (
    <>
      <section className="bg-secondary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">貸し切り予約</h1>
          <p className="mt-2 text-white/80">Charter Reservation</p>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6 bg-accent/10 border-accent/30">
              <p className="text-sm text-text">
                ドッグランを貸し切りでご利用いただけます。グループ利用や誕生日パーティー、イベントなどに最適です。
              </p>
              <p className="text-sm text-text-muted mt-2">
                ※ 貸し切り予約にはキャンセルポリシーが適用されます。詳しくはフォーム内でご確認ください。
              </p>
            </Card>

            <CharterForm />
          </div>
        </Container>
      </section>
    </>
  );
}
