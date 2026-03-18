import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ReserveForm } from "@/components/forms/ReserveForm";

export const metadata: Metadata = {
  title: "来場連絡",
  description:
    "零ちゃっちゃファームDOG RUNへの来場連絡フォーム。キャンセル料はかかりません。",
};

interface ReservePageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function ReservePage({ searchParams }: ReservePageProps) {
  const params = await searchParams;
  const defaultDate = params.date ?? "";

  return (
    <>
      <section className="bg-primary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">来場連絡</h1>
          <p className="mt-2 text-white/80">Visit Notification</p>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6 bg-accent/10 border-accent/30">
              <p className="text-sm text-text">
                ご来場の予定時刻をお知らせください。厳密な時間枠の予約ではありませんので、前後しても構いません。
              </p>
              <p className="text-sm text-primary font-medium mt-2">
                キャンセル料はかかりません。お気軽にご連絡ください。
              </p>
            </Card>

            <ReserveForm defaultDate={defaultDate} />
          </div>
        </Container>
      </section>
    </>
  );
}
