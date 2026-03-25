export interface Nudge {
  id: string
  type: 'staffing' | 'cost' | 'validation' | 'missing' | 'margin'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  suggested_action: string
  rule_id: string
}

export interface NudgeResponse {
  nudges: Nudge[]
  cached: boolean
  generated_at: string
  error?: string
}
