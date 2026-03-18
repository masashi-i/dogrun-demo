import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

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

// 来場連絡を保存
export async function POST(request: NextRequest) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('reservations')
    .insert([body])
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
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}