-- cancel_tokenカラムをreservations・chartersテーブルに追加
-- Supabase SQL Editorで実行してください

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cancel_token text;
ALTER TABLE charters ADD COLUMN IF NOT EXISTS cancel_token text;
