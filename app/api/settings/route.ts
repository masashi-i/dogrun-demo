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
  const PROTECTED_KEYS = ['admin_password', 'admin_email']
  if (PROTECTED_KEYS.includes(key)) {
    return NextResponse.json({ error: 'この設定はPATCHで直接更新できません' }, { status: 400 })
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

/** パスワード検証ヘルパー */
async function verifyPassword(password: string): Promise<{ valid: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'admin_password')
    .single()

  if (error || !data?.value) {
    return { valid: false, error: 'パスワード情報の取得に失敗しました' }
  }

  const isValid = await bcrypt.compare(password, data.value)
  if (!isValid) {
    return { valid: false, error: '現在のパスワードが正しくありません' }
  }

  return { valid: true }
}

// パスワード変更 / メールアドレス変更
export async function PUT(request: NextRequest) {
  const body = await request.json()
  const action = body.action ?? 'change_password'

  // --- パスワード変更 ---
  if (action === 'change_password') {
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '現在のパスワードと新しいパスワードを入力してください' }, { status: 400 })
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'パスワードは4文字以上にしてください' }, { status: 400 })
    }

    const check = await verifyPassword(currentPassword)
    if (!check.valid) {
      return NextResponse.json({ error: check.error }, { status: 403 })
    }

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

  // --- メールアドレス変更 ---
  if (action === 'change_email') {
    const { currentPassword, newEmail } = body

    if (!currentPassword || !newEmail) {
      return NextResponse.json({ error: 'パスワードと新しいメールアドレスを入力してください' }, { status: 400 })
    }

    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: 'メールアドレスの形式が正しくありません' }, { status: 400 })
    }

    const check = await verifyPassword(currentPassword)
    if (!check.valid) {
      return NextResponse.json({ error: check.error }, { status: 403 })
    }

    const { error: updateError } = await supabase
      .from('settings')
      .upsert(
        { key: 'admin_email', value: newEmail, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (updateError) {
      return NextResponse.json({ error: 'メールアドレスの更新に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: '不明なactionです' }, { status: 400 })
}
