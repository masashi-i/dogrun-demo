import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// 貸し切り予約一覧取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

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

  // 同日のキャンセル済み以外の既存予約を取得
  const { data: existing, error: fetchError } = await supabase
    .from('charters')
    .select('start_time, duration')
    .eq('date', body.date)
    .eq('status', 'CONFIRMED')

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const hasOverlap = (existing ?? []).some((row) => {
    const existStart = timeToMinutes(row.start_time)
    const existEnd = existStart + (row.duration ?? 0) * 60
    // 2つの時間帯が重なる条件: 開始A < 終了B かつ 開始B < 終了A
    return newStart < existEnd && existStart < newEnd
  })

  if (hasOverlap) {
    return NextResponse.json(
      { error: '指定の日時はすでに貸し切り予約が入っています' },
      { status: 409 }
    )
  }

  // --- 予約番号を生成して保存 ---
  const reservationNumber = `CHT-${Date.now()}`

  const { data, error } = await supabase
    .from('charters')
    .insert([{ ...body, reservation_number: reservationNumber }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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