"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

/** スライドショーで表示する画像 */
const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1598134025798-bfb6540ca748?w=1600&q=80",
    alt: "ボーダーコリーがフリスビーをキャッチする瞬間",
  },
  {
    src: "https://images.unsplash.com/photo-1600606704395-55bb56859122?w=1600&q=80",
    alt: "犬が芝生フィールドを駆け回る様子",
  },
  {
    src: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1600&q=80",
    alt: "笑顔の犬が楽しそうに遊ぶ様子",
  },
  {
    src: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=80",
    alt: "犬と飼い主のふれあい",
  },
];

/** 自動切り替え間隔（ミリ秒） */
const INTERVAL_MS = 5000;

export function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <>
      {HERO_IMAGES.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          className={`object-cover transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          priority={index === 0}
        />
      ))}
    </>
  );
}
