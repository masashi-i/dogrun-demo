-- 管理者メールアドレスをsettingsテーブルに追加
-- Supabase SQL Editorで実行してください

INSERT INTO settings (key, value, updated_at) VALUES
  ('admin_email', 'masashi.ito@nifty.com', now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
