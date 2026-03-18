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

// 貸し切り予約を保存
export async function POST(request: NextRequest) {
  const body = await request.json()

  // 予約番号を生成
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