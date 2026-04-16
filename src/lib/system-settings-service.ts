import { supabase } from './supabase'

export const DEFAULT_APPROVAL_THRESHOLD = 50_000
export const DEFAULT_GP_THRESHOLD_PCT = 20

export interface SystemSettingAudit {
  updated_at: string | null
  updated_by_name: string | null
}

/** Read the configurable approval threshold from system_settings. Falls back to 50000. */
export async function getApprovalThreshold(): Promise<number> {
  if (!supabase) return DEFAULT_APPROVAL_THRESHOLD

  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'approval_threshold')
    .maybeSingle()

  if (error || !data) return DEFAULT_APPROVAL_THRESHOLD

  const val = data.value as { amount?: number }
  return val.amount ?? DEFAULT_APPROVAL_THRESHOLD
}

/** Read the configurable GP% threshold from system_settings. Falls back to 20%. */
export async function getGPThreshold(): Promise<number> {
  if (!supabase) return DEFAULT_GP_THRESHOLD_PCT

  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'gp_threshold_pct')
    .maybeSingle()

  if (error || !data) return DEFAULT_GP_THRESHOLD_PCT

  const val = data.value as { pct?: number }
  return val.pct ?? DEFAULT_GP_THRESHOLD_PCT
}

/** Upsert a system setting by key. RLS restricts writes to admin role. */
export async function updateSystemSetting(
  key: string,
  value: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase is not configured' }

  const { data: userData } = await supabase.auth.getUser()
  const updated_by = userData.user?.id ?? null

  const { error } = await supabase
    .from('system_settings')
    .upsert(
      { key, value, updated_at: new Date().toISOString(), updated_by },
      { onConflict: 'key' }
    )

  if (error) return { success: false, error: error.message }
  return { success: true }
}

/** Fetch updated_at + updater's display name for a single system_settings row. */
export async function getSettingAudit(key: string): Promise<SystemSettingAudit> {
  if (!supabase) return { updated_at: null, updated_by_name: null }

  const { data, error } = await supabase
    .from('system_settings')
    .select('updated_at, updated_by')
    .eq('key', key)
    .maybeSingle()

  if (error || !data) return { updated_at: null, updated_by_name: null }

  const updated_at = (data.updated_at as string | null) ?? null
  const updated_by = (data.updated_by as string | null) ?? null

  if (!updated_by) return { updated_at, updated_by_name: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', updated_by)
    .maybeSingle()

  return {
    updated_at,
    updated_by_name: (profile?.full_name as string | undefined) ?? null,
  }
}
