import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// 設定一覧取得
export async function GET() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('key', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// 設定値を更新
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { key, value } = body

  if (!key) {
    return NextResponse.json({ error: 'keyは必須です' }, { status: 400 })
  }

  // upsert: 存在すれば更新、なければ挿入
  const { data, error } = await supabase
    .from('settings')
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
