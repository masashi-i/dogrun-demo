-- 定休日テーブルを作成
-- Supabase SQL Editorで実行してください

create table if not exists regular_holidays (
  id uuid default gen_random_uuid() primary key,
  day_of_week integer not null, -- 0:日, 1:月, 2:火, 3:水, 4:木, 5:金, 6:土
  created_at timestamp with time zone default now(),
  unique(day_of_week)
);
