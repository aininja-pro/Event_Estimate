import { supabase } from './supabase'
import type { NudgeResponse } from '@/types/nudge'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function fetchNudges(estimateId: string, estimateState: Record<string, unknown>): Promise<NudgeResponse> {
  try {
    const res = await fetch(`${API_URL}/api/ai/nudges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimate_id: estimateId, estimate_state: estimateState }),
    })
    if (!res.ok) {
      return { nudges: [], cached: false, generated_at: new Date().toISOString(), error: 'AI service temporarily unavailable' }
    }
    return await res.json()
  } catch {
    return { nudges: [], cached: false, generated_at: new Date().toISOString(), error: 'AI service temporarily unavailable' }
  }
}

export async function dismissNudge(estimateId: string, nudgeId: string, userId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('estimate_nudge_dismissals').upsert(
    { estimate_id: estimateId, nudge_id: nudgeId, dismissed_by: userId },
    { onConflict: 'estimate_id,nudge_id' }
  )
}

export async function getDismissedNudges(estimateId: string): Promise<string[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('estimate_nudge_dismissals')
    .select('nudge_id')
    .eq('estimate_id', estimateId)
  return (data || []).map((row) => row.nudge_id)
}
