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
