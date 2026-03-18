"use client";

import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { DogBreedInput } from "./DogBreedInput";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { DogSize } from "@/types";

export function DogFieldArray() {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dogs",
  });

  function handleSizeDetected(index: number, size: DogSize) {
    setValue(`dogs.${index}.size`, size);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text">
          犬の情報 <span className="text-red-600">*</span>
        </h3>
        <p className="text-xs text-text-muted">
          サイズ目安：小型 〜10kg / 中型 10〜25kg / 大型 25kg〜
        </p>
      </div>

      {fields.map((field, index) => {
        const dogErrors = (errors.dogs as Record<string, Record<string, { message?: string }>> | undefined)?.[index];

        return (
          <div
            key={field.id}
            className="rounded-lg border border-secondary/20 bg-white p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">
                {index + 1}頭目
              </span>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  削除
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 犬の名前 */}
              <Input
                label="犬の名前"
                required
                {...register(`dogs.${index}.name`)}
                error={dogErrors?.name?.message}
              />

              {/* 犬種 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-text">
                  犬種 <span className="text-red-600 ml-1">*</span>
                </label>
                <Controller
                  control={control}
                  name={`dogs.${index}.breed`}
                  render={({ field: f }) => (
                    <DogBreedInput
                      value={f.value}
                      onChange={f.onChange}
                      onSizeDetected={(size) =>
                        handleSizeDetected(index, size)
                      }
                      error={dogErrors?.breed?.message}
                    />
                  )}
                />
                {dogErrors?.breed?.message && (
                  <p className="text-sm text-red-600">
                    {dogErrors.breed.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* サイズ */}
              <div className="space-y-1">
                <span className="block text-sm font-medium text-text">
                  サイズ <span className="text-red-600 ml-1">*</span>
                </span>
                <div className="flex gap-4">
                  {(
                    [
                      { value: "SMALL", label: "小型犬" },
                      { value: "MEDIUM", label: "中型犬" },
                      { value: "LARGE", label: "大型犬" },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer min-h-[44px]"
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register(`dogs.${index}.size`)}
                        className="w-4 h-4 text-primary focus:ring-primary/50"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {dogErrors?.size?.message && (
                  <p className="text-sm text-red-600">
                    {dogErrors.size.message}
                  </p>
                )}
              </div>

              {/* 性別 */}
              <div className="space-y-1">
                <span className="block text-sm font-medium text-text">
                  性別 <span className="text-red-600 ml-1">*</span>
                </span>
                <div className="flex gap-4">
                  {(
                    [
                      { value: "MALE", label: "オス" },
                      { value: "FEMALE", label: "メス" },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer min-h-[44px]"
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register(`dogs.${index}.gender`)}
                        className="w-4 h-4 text-primary focus:ring-primary/50"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {dogErrors?.gender?.message && (
                  <p className="text-sm text-red-600">
                    {dogErrors.gender.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* 犬の追加エラー */}
      {errors.dogs?.message && typeof errors.dogs.message === "string" && (
        <p className="text-sm text-red-600">{errors.dogs.message}</p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ name: "", breed: "", size: "", gender: "" })
        }
      >
        + 犬を追加
      </Button>
    </div>
  );
}
