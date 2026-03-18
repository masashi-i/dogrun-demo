import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { getNotificationEmail, sendReservationOwnerEmail, sendReservationUserEmail } from '@/lib/email'

// 来場連絡一覧取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  let query = supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })

  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

/** 「10時頃」「9:30」等の自由テキストから時間を分単位で抽出 */
function parseTimeToMinutes(time: string): number | null {
  // "HH:MM" 形式
  const hhmmMatch = time.match(/(\d{1,2}):(\d{2})/)
  if (hhmmMatch) {
    return parseInt(hhmmMatch[1], 10) * 60 + parseInt(hhmmMatch[2], 10)
  }
  // "10時頃" "9時" 等
  const hourMatch = time.match(/(\d{1,2})時/)
  if (hourMatch) {
    return parseInt(hourMatch[1], 10) * 60
  }
  // 数字のみ（"10" → 10時として扱う）
  const numMatch = time.match(/^(\d{1,2})$/)
  if (numMatch) {
    const h = parseInt(numMatch[1], 10)
    if (h >= 6 && h <= 20) return h * 60
  }
  return null
}

/** "HH:MM" を分に変換 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

// 来場連絡を保存
export async function POST(request: NextRequest) {
  const body = await request.json()

  // 来場時刻を分単位に変換
  const visitMinutes = parseTimeToMinutes(body.time ?? '')

  if (visitMinutes !== null) {
    // 同日の確定済み貸し切り予約を取得
    const { data: charters, error: charterError } = await supabase
      .from('charters')
      .select('start_time, duration')
      .eq('date', body.date)
      .eq('status', 'CONFIRMED')

    if (charterError) return NextResponse.json({ error: charterError.message }, { status: 500 })

    // 来場時刻が貸し切り時間帯に含まれるかチェック
    const hasOverlap = (charters ?? []).some((c) => {
      const charterStart = timeToMinutes(c.start_time)
      const charterEnd = charterStart + (c.duration ?? 0) * 60
      return visitMinutes >= charterStart && visitMinutes < charterEnd
    })

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'この時間帯は貸し切り予約が入っているため来場連絡できません' },
        { status: 409 }
      )
    }
  }

  const { data, error } = await supabase
    .from('reservations')
    .insert([body])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // メール送信（失敗してもDB保存は成功とする）
  const emailData = {
    representative_name: body.representative_name,
    date: body.date,
    time: body.time,
    adult_count: body.adult_count,
    dogs: body.dogs ?? [],
    phone: body.phone,
    email: body.email,
    estimated_fee: body.estimated_fee ?? 0,
    note: body.note,
  }

  try {
    const ownerEmail = await getNotificationEmail()
    console.log('[reservations/POST] 通知先メール:', ownerEmail || '(未設定)')
    console.log('[reservations/POST] ユーザーメール:', emailData.email || '(なし)')

    await Promise.all([
      sendReservationOwnerEmail(ownerEmail, emailData),
      sendReservationUserEmail(emailData),
    ])
    console.log('[reservations/POST] メール送信完了')
  } catch (emailErr) {
    console.error('[reservations/POST] メール送信エラー:', emailErr)
  }

  return NextResponse.json(data, { status: 201 })
}

// ステータス更新
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { id, status } = body

  const { data, error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}