import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// 臨時休業日一覧取得
export async function GET() {
  const { data, error } = await supabase
    .from('closed_days')
    .select('*')
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// 臨時休業日を追加
export async function POST(request: NextRequest) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('closed_days')
    .insert([body])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// 臨時休業日を削除
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const { error } = await supabase
    .from('closed_days')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}