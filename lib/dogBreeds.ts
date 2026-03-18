export type DogSize = "SMALL" | "MEDIUM" | "LARGE";
export type DogBreed = { name: string; size: DogSize };

export const DOG_BREEDS: DogBreed[] = [
  // 小型犬（〜10kg）
  { name: "チワワ", size: "SMALL" },
  { name: "トイプードル", size: "SMALL" },
  { name: "ポメラニアン", size: "SMALL" },
  { name: "ミニチュアダックスフンド", size: "SMALL" },
  { name: "マルチーズ", size: "SMALL" },
  { name: "ヨークシャーテリア", size: "SMALL" },
  { name: "シーズー", size: "SMALL" },
  { name: "パピヨン", size: "SMALL" },
  { name: "ミニチュアピンシャー", size: "SMALL" },
  { name: "イタリアングレーハウンド", size: "SMALL" },
  { name: "フレンチブルドッグ", size: "SMALL" },
  { name: "パグ", size: "SMALL" },
  { name: "キャバリア", size: "SMALL" },
  { name: "ビーグル", size: "SMALL" },
  { name: "コーギー", size: "SMALL" },
  { name: "日本スピッツ", size: "SMALL" },
  // 中型犬（10〜25kg）
  { name: "柴犬", size: "MEDIUM" },
  { name: "ウィペット", size: "MEDIUM" },
  { name: "ボーダーコリー", size: "MEDIUM" },
  { name: "スピッツ", size: "MEDIUM" },
  { name: "アメリカンコッカースパニエル", size: "MEDIUM" },
  { name: "イングリッシュスプリンガースパニエル", size: "MEDIUM" },
  { name: "シェットランドシープドッグ", size: "MEDIUM" },
  { name: "バセットハウンド", size: "MEDIUM" },
  { name: "ブルドッグ", size: "MEDIUM" },
  { name: "ダルメシアン", size: "MEDIUM" },
  { name: "サモエド", size: "MEDIUM" },
  { name: "シベリアンハスキー", size: "MEDIUM" },
  { name: "甲斐犬", size: "MEDIUM" },
  // 大型犬（25kg〜）
  { name: "ラブラドールレトリバー", size: "LARGE" },
  { name: "ゴールデンレトリバー", size: "LARGE" },
  { name: "ジャーマンシェパード", size: "LARGE" },
  { name: "バーニーズマウンテンドッグ", size: "LARGE" },
  { name: "グレートデン", size: "LARGE" },
  { name: "アイリッシュセッター", size: "LARGE" },
  { name: "ドーベルマン", size: "LARGE" },
  { name: "ロットワイラー", size: "LARGE" },
  { name: "秋田犬", size: "LARGE" },
  // ミックス
  { name: "ミックス（小型）", size: "SMALL" },
  { name: "ミックス（中型）", size: "MEDIUM" },
  { name: "ミックス（大型）", size: "LARGE" },
];

/** 犬種名でサイズを検索（自由入力で一致しない場合は undefined） */
export function getSizeByBreed(breed: string): DogSize | undefined {
  return DOG_BREEDS.find((b) => b.name === breed)?.size;
}
