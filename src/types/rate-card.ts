export interface RateRange {
  min: number
  max: number
  avg: number
  median: number
}

export interface RateCardRole {
  role: string
  rate_units: string[]
  gl_codes: string[]
  occurrences: number
  has_ot_variant: boolean
  has_dt_variant: boolean
  has_weekend_variant: boolean
  has_afterhours_variant: boolean
  unit_rate_range: RateRange
  unit_rate_range_raw: RateRange
  margin_range: RateRange
}
