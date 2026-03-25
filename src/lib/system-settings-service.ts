import { supabase } from './supabase'

const DEFAULT_APPROVAL_THRESHOLD = 50_000
const DEFAULT_GP_THRESHOLD_PCT = 20

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
