-- 管理者パスワード（ハッシュ化済み）をsettingsテーブルに追加
-- Supabase SQL Editorで実行してください
-- ※ 初期パスワード: 8888

INSERT INTO settings (key, value, updated_at) VALUES
  ('admin_password', '$2b$10$QUOwtlER5EwTTl1YEK5/J.R9OkCO4xHS9kW24fUcEnzMSJg504bSK', now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
