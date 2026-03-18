import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

import { getSiteSettings } from '@/lib/siteSettings'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

/** settingsテーブルから通知先メールアドレスを取得 */
export async function getNotificationEmail(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notification_email')
      .single()
    if (error || !data) return ''
    return data.value ?? ''
  } catch (err) {
    console.error('通知先メールアドレスの取得に失敗:', err)
    return ''
  }
}

// --- 共通HTMLレイアウト ---

interface LayoutContext {
  siteName: string
  phone: string
  address: string
}

function layout(title: string, body: string, ctx: LayoutContext): string {
  return `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Helvetica Neue',Arial,'Hiragino Sans','Meiryo',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <!-- ヘッダー -->
        <tr>
          <td style="background:#5C7A4E;padding:24px 32px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">${ctx.siteName}</p>
          </td>
        </tr>
        <!-- タイトル -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <h1 style="margin:0;font-size:18px;color:#2C2416;">${title}</h1>
          </td>
        </tr>
        <!-- 本文 -->
        <tr>
          <td style="padding:8px 32px 24px;color:#2C2416;font-size:14px;line-height:1.8;">
            ${body}
          </td>
        </tr>
        <!-- フッター -->
        <tr>
          <td style="background:#F5F0E8;padding:20px 32px;text-align:center;font-size:12px;color:#6B5C47;">
            <p style="margin:0;font-weight:bold;">${ctx.siteName}</p>
            ${ctx.address ? `<p style="margin:4px 0 0;">${ctx.address}</p>` : ''}
            ${ctx.phone ? `<p style="margin:4px 0 0;">TEL: ${ctx.phone}</p>` : ''}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 12px;font-size:13px;color:#6B5C47;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:8px 12px;font-size:14px;color:#2C2416;">${value}</td>
    </tr>`
}

function infoTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;border-radius:8px;margin:16px 0;">${rows}</table>`
}

function formatYen(amount: number): string {
  return `${amount.toLocaleString()}円`
}

// --- 犬情報のHTML ---

interface DogInfo {
  name: string
  breed: string
  size: string
  gender: string
}

const SIZE_LABELS: Record<string, string> = { SMALL: '小型犬', MEDIUM: '中型犬', LARGE: '大型犬' }
const GENDER_LABELS: Record<string, string> = { MALE: 'オス', FEMALE: 'メス' }

function dogListHtml(dogs: DogInfo[]): string {
  if (!Array.isArray(dogs) || dogs.length === 0) return '—'
  return dogs.map((d, i) =>
    `${i + 1}. ${d.name}（${d.breed}・${SIZE_LABELS[d.size] ?? d.size}・${GENDER_LABELS[d.gender] ?? d.gender}）`
  ).join('<br>')
}

// --- 来場連絡メール ---

interface ReservationEmailData {
  representative_name: string
  date: string
  time: string
  adult_count: number
  dogs: DogInfo[]
  phone: string
  email: string
  estimated_fee: number
  note?: string
  cancel_token?: string
}

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export async function sendReservationOwnerEmail(ownerEmail: string, data: ReservationEmailData): Promise<void> {
  if (!ownerEmail) {
    console.log('[email] 経営者メール: 宛先未設定のためスキップ')
    return
  }

  const site = await getSiteSettings()

  const rows =
    infoRow('来場日', data.date) +
    infoRow('時刻', data.time) +
    infoRow('代表者', data.representative_name) +
    infoRow('電話番号', data.phone) +
    infoRow('メール', data.email) +
    infoRow('大人人数', `${data.adult_count}人`) +
    infoRow('犬', dogListHtml(data.dogs)) +
    infoRow('概算料金', formatYen(data.estimated_fee)) +
    (data.note ? infoRow('備考', data.note) : '')

  const body = `
    <p>新しい来場連絡が入りました。</p>
    ${infoTable(rows)}
  `

  try {
    console.log(`[email] 経営者へ来場連絡メール送信: from=${FROM_EMAIL}, to=${ownerEmail}`)
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ownerEmail,
      subject: `【来場連絡】${data.representative_name}様 ${data.date}`,
      html: layout('来場連絡が届きました', body, site),
    })
    console.log('[email] 経営者へ来場連絡メール送信成功:', result)
  } catch (err) {
    console.error('[email] 経営者への来場連絡メール送信失敗:', err)
  }
}

export async function sendReservationUserEmail(data: ReservationEmailData): Promise<void> {
  if (!data.email) {
    console.log('[email] ユーザーメール(来場): 宛先なしのためスキップ')
    return
  }

  const site = await getSiteSettings()

  const rows =
    infoRow('来場日', data.date) +
    infoRow('時刻', data.time) +
    infoRow('大人人数', `${data.adult_count}人`) +
    infoRow('犬', dogListHtml(data.dogs)) +
    infoRow('概算料金', formatYen(data.estimated_fee))

  const body = `
    <p>${data.representative_name} 様</p>
    <p>来場連絡を受け付けました。ありがとうございます。</p>
    ${infoTable(rows)}
    <p style="font-size:13px;color:#6B5C47;">
      ※ 概算料金は当日現金でのお支払いとなります。<br>
      ※ キャンセル料はかかりません。<br>
      ※ ワクチン接種証明書（1年以内）を忘れずにお持ちください。
    </p>
    ${data.cancel_token ? `
    <div style="margin:16px 0;padding:16px;background:#F5F0E8;border-radius:8px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#6B5C47;">ご都合が変わった場合はこちらからキャンセルできます。</p>
      <a href="${BASE_URL}/reserve/cancel?token=${data.cancel_token}" style="display:inline-block;padding:8px 24px;background:#8B6347;color:#ffffff;border-radius:6px;text-decoration:none;font-size:13px;">来場連絡をキャンセル</a>
    </div>
    ` : ''}
  `

  try {
    console.log(`[email] ユーザーへ来場確認メール送信: from=${FROM_EMAIL}, to=${data.email}`)
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `【${site.siteName}】来場連絡を受け付けました`,
      html: layout('来場連絡を受け付けました', body, site),
    })
    console.log('[email] ユーザーへ来場確認メール送信成功:', result)
  } catch (err) {
    console.error('[email] ユーザーへの来場連絡確認メール送信失敗:', err)
  }
}

// --- 貸し切り予約メール ---

interface CharterEmailData {
  reservation_number: string
  representative_name: string
  date: string
  start_time: string
  duration: number
  adult_count: number
  dogs: DogInfo[]
  phone: string
  email: string
  charter_fee: number
  estimated_usage_fee: number
  note?: string
  cancel_token?: string
}

function calcEndTime(startTime: string, hours: number): string {
  const match = startTime.match(/(\d{1,2}):(\d{2})/)
  if (!match) return ''
  const endHour = parseInt(match[1], 10) + hours
  return `${endHour}:${match[2]}`
}

export async function sendCharterOwnerEmail(ownerEmail: string, data: CharterEmailData): Promise<void> {
  if (!ownerEmail) {
    console.log('[email] 経営者メール(貸し切り): 宛先未設定のためスキップ')
    return
  }

  const site = await getSiteSettings()
  const endTime = calcEndTime(data.start_time, data.duration)

  const rows =
    infoRow('予約番号', data.reservation_number) +
    infoRow('貸し切り日', data.date) +
    infoRow('時間', `${data.start_time}〜${endTime}（${data.duration}時間）`) +
    infoRow('代表者', data.representative_name) +
    infoRow('電話番号', data.phone) +
    infoRow('メール', data.email) +
    infoRow('大人人数', `${data.adult_count}人`) +
    infoRow('犬', dogListHtml(data.dogs)) +
    infoRow('貸し切り料金', formatYen(data.charter_fee)) +
    infoRow('概算利用料金', formatYen(data.estimated_usage_fee)) +
    (data.note ? infoRow('備考', data.note) : '')

  const body = `
    <p>新しい貸し切り予約が入りました。</p>
    ${infoTable(rows)}
  `

  try {
    console.log(`[email] 経営者へ貸し切りメール送信: from=${FROM_EMAIL}, to=${ownerEmail}`)
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ownerEmail,
      subject: `【貸し切り予約】${data.representative_name}様 ${data.date}`,
      html: layout('貸し切り予約が届きました', body, site),
    })
    console.log('[email] 経営者へ貸し切りメール送信成功:', result)
  } catch (err) {
    console.error('[email] 経営者への貸し切り予約メール送信失敗:', err)
  }
}

export async function sendCharterUserEmail(data: CharterEmailData): Promise<void> {
  if (!data.email) {
    console.log('[email] ユーザーメール(貸し切り): 宛先なしのためスキップ')
    return
  }

  const site = await getSiteSettings()
  const endTime = calcEndTime(data.start_time, data.duration)

  const rows =
    infoRow('予約番号', `<strong>${data.reservation_number}</strong>`) +
    infoRow('貸し切り日', data.date) +
    infoRow('時間', `${data.start_time}〜${endTime}（${data.duration}時間）`) +
    infoRow('大人人数', `${data.adult_count}人`) +
    infoRow('犬', dogListHtml(data.dogs)) +
    infoRow('貸し切り料金', formatYen(data.charter_fee)) +
    infoRow('概算利用料金', formatYen(data.estimated_usage_fee))

  const cancelPolicy = `
    <div style="background:#F5F0E8;border-radius:8px;padding:16px;margin:16px 0;font-size:13px;color:#2C2416;">
      <p style="margin:0 0 8px;font-weight:bold;">【キャンセルポリシー（2026.1.1改訂）】</p>
      <p style="margin:0;">・3日前まで：無料<br>・1日前まで：貸し切り料金の50%<br>・当日：貸し切り料金の100%</p>
      <p style="margin:8px 0 0;">キャンセルのご連絡はお電話にてお願いいたします。${site.phone ? `<br>TEL: ${site.phone}` : ''}</p>
    </div>
  `

  const body = `
    <p>${data.representative_name} 様</p>
    <p>貸し切り予約を受け付けました。ありがとうございます。</p>
    ${infoTable(rows)}
    ${cancelPolicy}
    <p style="font-size:13px;color:#6B5C47;">
      ※ 利用料金（人数・頭数分）は別途当日現金でのお支払いとなります。<br>
      ※ ワクチン接種証明書（1年以内）を忘れずにお持ちください。
    </p>
    ${data.cancel_token ? `
    <div style="margin:16px 0;padding:16px;background:#F5F0E8;border-radius:8px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#6B5C47;">キャンセルをご希望の場合はこちらから手続きできます。</p>
      <a href="${BASE_URL}/charter/cancel?token=${data.cancel_token}" style="display:inline-block;padding:8px 24px;background:#8B6347;color:#ffffff;border-radius:6px;text-decoration:none;font-size:13px;">貸し切り予約をキャンセル</a>
      <p style="margin:8px 0 0;font-size:11px;color:#6B5C47;">※ キャンセルポリシーに基づきキャンセル料が発生する場合があります。</p>
    </div>
    ` : ''}
  `

  try {
    console.log(`[email] ユーザーへ貸し切り確認メール送信: from=${FROM_EMAIL}, to=${data.email}`)
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `【${site.siteName}】貸し切り予約を受け付けました`,
      html: layout('貸し切り予約を受け付けました', body, site),
    })
    console.log('[email] ユーザーへ貸し切り確認メール送信成功:', result)
  } catch (err) {
    console.error('[email] ユーザーへの貸し切り確認メール送信失敗:', err)
  }
}

// --- キャンセル通知メール ---

interface CancelNotificationData {
  type: 'reservation' | 'charter'
  representative_name: string
  date: string
  time?: string
  reservation_number?: string
}

export async function sendCancelNotificationEmail(ownerEmail: string, data: CancelNotificationData): Promise<void> {
  if (!ownerEmail) return

  const site = await getSiteSettings()
  const typeLabel = data.type === 'reservation' ? '来場連絡' : '貸し切り予約'

  const rows =
    infoRow('種別', typeLabel) +
    (data.reservation_number ? infoRow('予約番号', data.reservation_number) : '') +
    infoRow('代表者', data.representative_name) +
    infoRow('日付', data.date) +
    (data.time ? infoRow('時刻', data.time) : '')

  const body = `
    <p>${typeLabel}がキャンセルされました。</p>
    ${infoTable(rows)}
  `

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ownerEmail,
      subject: `【キャンセル】${data.representative_name}様 ${data.date}`,
      html: layout(`${typeLabel}がキャンセルされました`, body, site),
    })
    console.log('[email] キャンセル通知メール送信成功')
  } catch (err) {
    console.error('[email] キャンセル通知メール送信失敗:', err)
  }
}
