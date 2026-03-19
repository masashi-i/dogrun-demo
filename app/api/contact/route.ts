import { NextRequest, NextResponse } from 'next/server'
import { getNotificationEmail, sendContactOwnerEmail, sendContactUserEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const { inquiryType, name, phone, email, dogInfo, preferredDate, content } = body

  if (!inquiryType || !name || !phone || !email || !content) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }

  const emailData = {
    inquiry_type: inquiryType as string,
    name: name as string,
    phone: phone as string,
    email: email as string,
    dog_info: (dogInfo as string) || '',
    preferred_date: (preferredDate as string) || '',
    content: content as string,
  }

  try {
    const ownerEmail = await getNotificationEmail()
    await Promise.all([
      sendContactOwnerEmail(ownerEmail, emailData),
      sendContactUserEmail(emailData),
    ])
    console.log('[contact/POST] メール送信完了')
  } catch (emailErr) {
    console.error('[contact/POST] メール送信エラー:', emailErr)
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
