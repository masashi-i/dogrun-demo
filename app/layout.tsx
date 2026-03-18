import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | 零ちゃっちゃファーム DOG RUN",
    default: "零ちゃっちゃファーム DOG RUN",
  },
  description:
    "多治見市の広大な2,000㎡人工芝ドッグラン。全犬種対応、大型犬も全力疾走OK。犬の訓練士・ドッグマッサージ・ディスクドッグ体験も。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
