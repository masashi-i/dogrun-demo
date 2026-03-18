import { randomUUID } from 'crypto'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { getNotificationEmail, sendCharterOwnerEmail, sendCharterUserEmail, sendCancelNotificationEmail } from '@/lib/email'

// 貸し切り予約一覧取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const cancelToken = searchParams.get('cancel_token')

  // cancel_tokenで1件取得（キャンセルページ用）
  if (cancelToken) {
    const { data, error } = await supabase
      .from('charters')
      .select('*')
      .eq('cancel_token', cancelToken)
      .single()
    if (error || !data) return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 })
    return NextResponse.json(data)
  }

  let query = supabase
    .from('charters')
    .select('*')
    .order('created_at', { ascending: false })

  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

/** "HH:MM" を分に変換 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

// 貸し切り予約を保存
export async function POST(request: NextRequest) {
  const body = await request.json()

  // --- 重複チェック ---
  const newStart = timeToMinutes(body.start_time)
  const newEnd = newStart + (body.duration ?? 0) * 60

  const { data: existing, error: fetchError } = await supabase
    .from('charters')
    .select('start_time, duration')
    .eq('date', body.date)
    .eq('status', 'CONFIRMED')

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const hasOverlap = (existing ?? []).some((row) => {
    const existStart = timeToMinutes(row.start_time)
    const existEnd = existStart + (row.duration ?? 0) * 60
    return newStart < existEnd && existStart < newEnd
  })

  if (hasOverlap) {
    return NextResponse.json(
      { error: '指定の日時はすでに貸し切り予約が入っています' },
      { status: 409 }
    )
  }

  // --- 予約番号・cancel_tokenを生成して保存 ---
  const reservationNumber = `CHT-${Date.now()}`
  const cancelToken = randomUUID()

  const { data, error } = await supabase
    .from('charters')
    .insert([{ ...body, reservation_number: reservationNumber, cancel_token: cancelToken }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // メール送信（失敗してもDB保存は成功とする）
  const emailData = {
    reservation_number: reservationNumber,
    representative_name: body.representative_name,
    date: body.date,
    start_time: body.start_time,
    duration: body.duration,
    adult_count: body.adult_count,
    dogs: body.dogs ?? [],
    phone: body.phone,
    email: body.email,
    charter_fee: body.charter_fee ?? 0,
    estimated_usage_fee: body.estimated_usage_fee ?? 0,
    note: body.note,
    cancel_token: cancelToken,
  }

  try {
    const ownerEmail = await getNotificationEmail()
    await Promise.all([
      sendCharterOwnerEmail(ownerEmail, emailData),
      sendCharterUserEmail(emailData),
    ])
    console.log('[charters/POST] メール送信完了')
  } catch (emailErr) {
    console.error('[charters/POST] メール送信エラー:', emailErr)
  }

  return NextResponse.json(data, { status: 201 })
}

// ステータス更新
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { id, status } = body

  const { data, error } = await supabase
    .from('charters')
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

  const { data: charter, error: fetchError } = await supabase
    .from('charters')
    .select('*')
    .eq('cancel_token', cancelToken)
    .single()

  if (fetchError || !charter) {
    return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 })
  }

  if (charter.status !== 'CONFIRMED') {
    return NextResponse.json({ error: 'この予約はすでにキャンセル済みです' }, { status: 409 })
  }

  // キャンセル料を計算してステータスを決定
  const visitDate = new Date(charter.date + 'T00:00:00')
  const now = new Date()
  const daysLeft = Math.ceil((visitDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  let newStatus: string
  if (daysLeft >= 3) {
    newStatus = 'CANCELLED_FREE'
  } else if (daysLeft >= 1) {
    newStatus = 'CANCELLED_50'
  } else {
    newStatus = 'CANCELLED_100'
  }

  const { error: updateError } = await supabase
    .from('charters')
    .update({ status: newStatus })
    .eq('id', charter.id)

  if (updateError) {
    return NextResponse.json({ error: 'キャンセル処理に失敗しました' }, { status: 500 })
  }

  // 経営者へキャンセル通知メール
  try {
    const ownerEmail = await getNotificationEmail()
    await sendCancelNotificationEmail(ownerEmail, {
      type: 'charter',
      representative_name: charter.representative_name,
      date: charter.date,
      time: charter.start_time,
      reservation_number: charter.reservation_number,
    })
  } catch (emailErr) {
    console.error('[charters/DELETE] キャンセル通知メール送信エラー:', emailErr)
  }

  return NextResponse.json({ success: true, status: newStatus })
}
