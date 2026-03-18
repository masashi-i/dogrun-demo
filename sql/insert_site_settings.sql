-- 施設情報をsettingsテーブルに追加
-- Supabase SQL Editorで実行してください

INSERT INTO settings (key, value, updated_at) VALUES
  ('site_name', '零ちゃっちゃファーム DOG RUN', now()),
  ('phone', '000-0000-0000', now()),
  ('address', '多治見市下沢町（番地：未定）', now()),
  ('instagram_url', 'https://www.instagram.com/reichaccha_farm_whippet/', now()),
  ('business_hours', '9:00〜日没（季節により変動）', now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
