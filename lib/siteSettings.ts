import { supabase } from '@/lib/supabase'

export interface SiteSettings {
  siteName: string
  phone: string
  address: string
  instagramUrl: string
  businessHours: string
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: '零ちゃっちゃファーム DOG RUN',
  phone: '000-0000-0000',
  address: '多治見市下沢町（番地：未定）',
  instagramUrl: 'https://www.instagram.com/reichaccha_farm_whippet/',
  businessHours: '9:00〜日没（季節により変動）',
}

/** settingsテーブルのkey → SiteSettingsフィールドの対応 */
const KEY_MAP: Record<string, keyof SiteSettings> = {
  site_name: 'siteName',
  phone: 'phone',
  address: 'address',
  instagram_url: 'instagramUrl',
  business_hours: 'businessHours',
}

// --- インメモリキャッシュ ---
let cachedSettings: SiteSettings | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 1000 // 60秒

/**
 * settingsテーブルから施設情報を取得する
 * 60秒間のインメモリキャッシュ付き
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const now = Date.now()
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedSettings
  }

  try {
    const keys = Object.keys(KEY_MAP)
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', keys)

    if (error) {
      console.error('[siteSettings] DB取得エラー:', error.message)
      return cachedSettings ?? DEFAULT_SETTINGS
    }

    const settings = { ...DEFAULT_SETTINGS }
    for (const row of data ?? []) {
      const field = KEY_MAP[row.key]
      if (field && row.value) {
        settings[field] = row.value
      }
    }

    cachedSettings = settings
    cacheTimestamp = now
    return settings
  } catch (err) {
    console.error('[siteSettings] 取得失敗:', err)
    return cachedSettings ?? DEFAULT_SETTINGS
  }
}
