"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { DOG_BREEDS } from "@/lib/dogBreeds";
import { cn } from "@/lib/utils";

/** サイズカテゴリの表示ラベル */
const SIZE_LABELS: Record<string, string> = {
  SMALL: "小型犬",
  MEDIUM: "中型犬",
  LARGE: "大型犬",
};

/** サイズカテゴリの表示順 */
const SIZE_ORDER = ["SMALL", "MEDIUM", "LARGE"] as const;

interface DogBreedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSizeDetected?: (size: "SMALL" | "MEDIUM" | "LARGE") => void;
  error?: string;
}

export function DogBreedInput({
  value,
  onChange,
  onSizeDetected,
  error,
}: DogBreedInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // フィルタリング結果
  const filteredBreeds = useMemo(() => {
    if (!value) return DOG_BREEDS;
    return DOG_BREEDS.filter((b) => b.name.includes(value));
  }, [value]);

  // サイズカテゴリごとにグルーピング
  const groupedBreeds = useMemo(() => {
    const groups = new Map<string, typeof DOG_BREEDS>();
    for (const size of SIZE_ORDER) {
      const items = filteredBreeds.filter((b) => b.size === size);
      if (items.length > 0) {
        groups.set(size, items);
      }
    }
    return groups;
  }, [filteredBreeds]);

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(breedName: string, size: "SMALL" | "MEDIUM" | "LARGE") {
    onChange(breedName);
    onSizeDetected?.(size);
    setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          placeholder="犬種を選択または入力"
          className={cn(
            "w-full rounded-lg border border-secondary/30 bg-white px-3 py-2.5 pr-8 text-text placeholder:text-text-muted/50 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
            error && "border-red-500 focus:ring-red-500/50"
          )}
          autoComplete="off"
        />
        {/* ドロップダウン矢印 */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted/60 hover:text-text-muted"
        >
          <svg
            className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* ドロップダウンリスト */}
      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-secondary/20 bg-white shadow-lg"
        >
          {filteredBreeds.length === 0 ? (
            <li className="px-3 py-3 text-sm text-text-muted text-center">
              該当する犬種がありません
            </li>
          ) : (
            Array.from(groupedBreeds.entries()).map(([size, breeds]) => (
              <li key={size}>
                {/* カテゴリヘッダー */}
                <div className="sticky top-0 px-3 py-1.5 text-xs font-bold text-text-muted bg-surface-dark border-b border-secondary/10">
                  {SIZE_LABELS[size]}
                </div>
                <ul>
                  {breeds.map((breed) => (
                    <li key={breed.name}>
                      <button
                        type="button"
                        onClick={() => handleSelect(breed.name, breed.size)}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-primary/5 transition-colors flex items-center justify-between",
                          value === breed.name && "bg-primary/10 font-medium"
                        )}
                      >
                        <span>{breed.name}</span>
                        <span className="text-xs text-text-muted">
                          {SIZE_LABELS[breed.size]}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
