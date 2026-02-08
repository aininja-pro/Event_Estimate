export interface RateRange {
  min: number
  max: number
  avg: number
  median: number
}

export interface RateCardRole {
  role: string
  gl_codes: string[]
  occurrences: number
  has_ot_variant: boolean
  unit_rate_range: RateRange
  cost_rate_range: RateRange
}
