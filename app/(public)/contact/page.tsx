"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { INQUIRY_TYPES } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      inquiryType: undefined,
      name: "",
      phone: "",
      email: "",
      dogInfo: "",
      preferredDate: "",
      content: "",
    },
  });

  function onSubmit(data: ContactInput) {
    // Phase 0: コンソールログのみ
    console.log("お問い合わせデータ:", data);
    setSubmitted(true);
  }

  return (
    <>
      <section className="bg-primary-dark text-white py-12 lg:py-16">
        <Container className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold">お問い合わせ</h1>
          <p className="mt-2 text-white/80">Contact</p>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <div className="max-w-2xl mx-auto">
            {submitted ? (
              <div className="text-center">
                <div className="text-5xl mb-6">✅</div>
                <h2 className="text-2xl font-bold mb-4">
                  お問い合わせを受け付けました
                </h2>
                <p className="text-text-muted mb-8">
                  内容を確認の上、折り返しご連絡いたします。
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  新しいお問い合わせ
                </Button>
              </div>
            ) : (
              <>
                <Card className="mb-6 bg-accent/10 border-accent/30">
                  <p className="text-sm text-text">
                    ドッグマッサージ・訓練士カウンセリング・ディスクドッグ体験のご予約もこちらから受け付けております。
                  </p>
                </Card>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Select
                    label="お問い合わせ種別"
                    required
                    options={INQUIRY_TYPES.map((t) => ({
                      value: t.value,
                      label: t.label,
                    }))}
                    placeholder="選択してください"
                    {...register("inquiryType")}
                    error={errors.inquiryType?.message}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="お名前"
                      required
                      {...register("name")}
                      error={errors.name?.message}
                    />
                    <Input
                      label="電話番号"
                      type="tel"
                      required
                      placeholder="090-0000-0000"
                      {...register("phone")}
                      error={errors.phone?.message}
                    />
                  </div>

                  <Input
                    label="メールアドレス"
                    type="email"
                    required
                    placeholder="example@email.com"
                    {...register("email")}
                    error={errors.email?.message}
                  />

                  <Input
                    label="犬の情報（犬種・年齢・名前など）"
                    placeholder="例：トイプードル 3歳 モモ"
                    {...register("dogInfo")}
                  />

                  <Input
                    label="希望日時"
                    placeholder="例：3月中の土曜日午前中"
                    {...register("preferredDate")}
                  />

                  <Textarea
                    label="お問い合わせ内容"
                    required
                    placeholder="ご質問やご要望をご記入ください"
                    {...register("content")}
                    error={errors.content?.message}
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "送信中..." : "お問い合わせを送信する"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
