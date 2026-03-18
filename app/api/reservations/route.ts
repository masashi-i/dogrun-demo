import { randomUUID } from 'crypto'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { getNotificationEmail, sendReservationOwnerEmail, sendReservationUserEmail, sendCancelNotificationEmail } from '@/lib/email'

// 来場連絡一覧取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const cancelToken = searchParams.get('cancel_token')

  // cancel_tokenで1件取得（キャンセルページ用）
  if (cancelToken) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('cancel_token', cancelToken)
      .single()
    if (error || !data) return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 })
    return NextResponse.json(data)
  }

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
  const hhmmMatch = time.match(/(\d{1,2}):(\d{2})/)
  if (hhmmMatch) {
    return parseInt(hhmmMatch[1], 10) * 60 + parseInt(hhmmMatch[2], 10)
  }
  const hourMatch = time.match(/(\d{1,2})時/)
  if (hourMatch) {
    return parseInt(hourMatch[1], 10) * 60
  }
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
    const { data: charters, error: charterError } = await supabase
      .from('charters')
      .select('start_time, duration')
      .eq('date', body.date)
      .eq('status', 'CONFIRMED')

    if (charterError) return NextResponse.json({ error: charterError.message }, { status: 500 })

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

  // cancel_tokenを生成して保存
  const cancelToken = randomUUID()

  const { data, error } = await supabase
    .from('reservations')
    .insert([{ ...body, cancel_token: cancelToken }])
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
    cancel_token: cancelToken,
  }

  try {
    const ownerEmail = await getNotificationEmail()
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

// キャンセル（cancel_tokenで認証）
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cancelToken = searchParams.get('cancel_token')

  if (!cancelToken) {
    return NextResponse.json({ error: 'cancel_tokenが必要です' }, { status: 400 })
  }

  // トークンで予約を検索
  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('*')
    .eq('cancel_token', cancelToken)
    .single()

  if (fetchError || !reservation) {
    return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 })
  }

  if (reservation.status === 'CANCELLED') {
    return NextResponse.json({ error: 'この予約はすでにキャンセル済みです' }, { status: 409 })
  }

  // ステータスをCANCELLEDに更新
  const { error: updateError } = await supabase
    .from('reservations')
    .update({ status: 'CANCELLED' })
    .eq('id', reservation.id)

  if (updateError) {
    return NextResponse.json({ error: 'キャンセル処理に失敗しました' }, { status: 500 })
  }

  // 経営者へキャンセル通知メール
  try {
    const ownerEmail = await getNotificationEmail()
    await sendCancelNotificationEmail(ownerEmail, {
      type: 'reservation',
      representative_name: reservation.representative_name,
      date: reservation.date,
      time: reservation.time,
    })
  } catch (emailErr) {
    console.error('[reservations/DELETE] キャンセル通知メール送信エラー:', emailErr)
  }

  return NextResponse.json({ success: true })
}
