export interface SectionCost {
  name: string
  avgBid: number
  avgActual: number | null
}

export interface CommonRole {
  role: string
  rateMin: number
  rateMax: number
  rateAvg: number
  occurrences: number
}

export interface SegmentSize {
  name: string
  avgSize: number
  count: number
}

export interface AIContext {
  totalEvents: number
  eventsWithRecap: number
  dateRange: {
    earliest: string | null
    latest: string | null
  }
  sections: SectionCost[]
  commonRoles: CommonRole[]
  revenueSegments: SegmentSize[]
}

export interface StaffingItem {
  role: string
  quantity: number
  days: number
  dailyRate: number
  totalCost: number
  rationale: string
}

export interface CostBreakdownItem {
  section: string
  estimatedCost: number
  percentOfTotal: number
  notes: string
}

export interface ScopeEstimate {
  summary: string
  staffing: StaffingItem[]
  costBreakdown: CostBreakdownItem[]
  totalEstimate: { low: number; mid: number; high: number }
  confidenceNotes: string[]
  marginRecommendation: { suggestedMarginPct: number; rationale: string }
}
