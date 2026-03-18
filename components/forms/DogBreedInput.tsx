"use client";

import { useState, useRef, useEffect } from "react";
import { DOG_BREEDS } from "@/lib/dogBreeds";
import { cn } from "@/lib/utils";

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
  const [filteredBreeds, setFilteredBreeds] = useState(DOG_BREEDS);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setFilteredBreeds(
        DOG_BREEDS.filter((b) => b.name.includes(value))
      );
    } else {
      setFilteredBreeds(DOG_BREEDS);
    }
  }, [value]);

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
        placeholder="犬種を入力（例：トイプードル）"
        className={cn(
          "w-full rounded-lg border border-secondary/30 bg-white px-3 py-2.5 text-text placeholder:text-text-muted/50 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
          error && "border-red-500 focus:ring-red-500/50"
        )}
        autoComplete="off"
      />

      {/* ドロップダウンリスト */}
      {isOpen && filteredBreeds.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-secondary/20 bg-white shadow-lg">
          {filteredBreeds.slice(0, 15).map((breed) => (
            <li key={breed.name}>
              <button
                type="button"
                onClick={() => handleSelect(breed.name, breed.size)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-primary/5 transition-colors flex items-center justify-between"
              >
                <span>{breed.name}</span>
                <span className="text-xs text-text-muted">
                  {breed.size === "SMALL"
                    ? "小型"
                    : breed.size === "MEDIUM"
                    ? "中型"
                    : "大型"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
