import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// お知らせ一覧取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const publishedOnly = searchParams.get('published') === 'true'

  let query = supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })

  if (publishedOnly) {
    query = query.eq('published', true)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// お知らせを作成
export async function POST(request: NextRequest) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('news')
    .insert([body])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// お知らせを更新
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { id, ...updates } = body

  const { data, error } = await supabase
    .from('news')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// お知らせを削除
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}