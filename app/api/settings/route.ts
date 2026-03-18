import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

/** GETで返さないキー（機密情報） */
const HIDDEN_KEYS = ['admin_password']

// 設定一覧取得（パスワードは除外）
export async function GET() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('key', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const filtered = (data ?? []).filter((row) => !HIDDEN_KEYS.includes(row.key))
  return NextResponse.json(filtered)
}

// 設定値を更新
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { key, value } = body

  if (!key) {
    return NextResponse.json({ error: 'keyは必須です' }, { status: 400 })
  }

  // admin_passwordはPATCHで直接更新不可（PUT /api/settings を使用）
  if (key === 'admin_password') {
    return NextResponse.json({ error: 'パスワードの変更は専用APIを使用してください' }, { status: 400 })
  }

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

// パスワード変更
export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: '現在のパスワードと新しいパスワードを入力してください' }, { status: 400 })
  }

  if (newPassword.length < 4) {
    return NextResponse.json({ error: 'パスワードは4文字以上にしてください' }, { status: 400 })
  }

  // 現在のパスワードを検証
  const { data: current, error: fetchError } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'admin_password')
    .single()

  if (fetchError || !current?.value) {
    return NextResponse.json({ error: 'パスワード情報の取得に失敗しました' }, { status: 500 })
  }

  const isValid = await bcrypt.compare(currentPassword, current.value)
  if (!isValid) {
    return NextResponse.json({ error: '現在のパスワードが正しくありません' }, { status: 403 })
  }

  // 新しいパスワードをハッシュ化して保存
  const SALT_ROUNDS = 10
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

  const { error: updateError } = await supabase
    .from('settings')
    .upsert(
      { key: 'admin_password', value: hashedPassword, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  if (updateError) {
    return NextResponse.json({ error: 'パスワードの更新に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
