-- 施設の緯度・経度をsettingsテーブルに追加
-- Supabase SQL Editorで実行してください
-- ※ 多治見市下沢町の仮座標（実際の座標に変更してください）

INSERT INTO settings (key, value, updated_at) VALUES
  ('latitude', '35.3328', now()),
  ('longitude', '137.1167', now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
