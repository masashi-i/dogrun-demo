import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// 定休日一覧取得
export async function GET() {
  const { data, error } = await supabase
    .from('regular_holidays')
    .select('*')
    .order('day_of_week', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// 定休日追加
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { day_of_week } = body

  if (day_of_week === undefined || day_of_week < 0 || day_of_week > 6) {
    return NextResponse.json({ error: '曜日（0〜6）を指定してください' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('regular_holidays')
    .insert([{ day_of_week }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// 定休日削除
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dayOfWeek = searchParams.get('day_of_week')

  if (dayOfWeek === null) {
    return NextResponse.json({ error: 'day_of_weekが必要です' }, { status: 400 })
  }

  const { error } = await supabase
    .from('regular_holidays')
    .delete()
    .eq('day_of_week', parseInt(dayOfWeek, 10))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
