export interface ClientRevenue {
  name: string
  count: number
  totalRevenue: number
}

export interface OfficeVolume {
  name: string
  count: number
  totalRevenue: number
}

export interface StatusCount {
  name: string
  count: number
}

export interface RevenueSegment {
  name: string
  count: number
  totalRevenue: number
}

export interface MonthlyEvent {
  month: string
  count: number
  revenue: number
}

export interface ExecutiveSummary {
  totalEvents: number
  totalRevenue: number
  avgEventSize: number
  medianEventSize: number
  eventsWithRecap: number
  topClientsByRevenue: ClientRevenue[]
  topOfficesByVolume: OfficeVolume[]
  statusDistribution: StatusCount[]
  revenueSegmentDistribution: RevenueSegment[]
  eventsByMonth: MonthlyEvent[]
}

export interface GrandTotalRange {
  label: string
  count: number
}

export interface NamedAggregate {
  name: string
  count: number
  totalRevenue: number
}

export interface StatusAggregate {
  name: string
  count: number
  totalRevenue: number
}

export interface SectionSummaryEntry {
  name: string
  eventCount: number
  percentOfEvents: number
}

export interface SectionSummary {
  totalEventsAnalyzed: number
  sections: SectionSummaryEntry[]
}

export interface SectionAggregate {
  name: string
  totalBid: number
  totalActual: number
  avgBid: number
  avgActual: number | null
  eventCount: number
  recapCount: number
}

export interface CostAnalysis {
  grandTotalRanges: GrandTotalRange[]
  totalEvents: number
  filesBidAndRecap: number
  byRevenueSegment: NamedAggregate[]
  byClient: NamedAggregate[]
  byLeadOffice: NamedAggregate[]
  byStatus: StatusAggregate[]
  sectionSummary: SectionSummary
  sectionAggregates: SectionAggregate[]
}

export interface VarianceSummary {
  avgVariancePct: number
  medianVariancePct: number
  count: number
}

export interface SectionVariance {
  name: string
  avgVariancePct: number
  totalOverUnder: number
  eventCount: number
}

export interface EntityVariance {
  name: string
  avgVariancePct: number
  totalOverUnder: number
  eventCount: number
}

export interface VarianceEvent {
  event_name: string
  client: string
  lead_office: string
  grandTotalBid: number
  grandTotalActual: number
  variance: number
  variancePct: number
}

export interface VarianceData {
  summary: VarianceSummary
  bySection: SectionVariance[]
  byClient: EntityVariance[]
  byOffice: EntityVariance[]
  events: VarianceEvent[]
}

export interface ManagerRecord {
  name: string
  eventCount: number
  totalRevenue: number
  avgEventSize: number
  clientsServed: number
  recapEventCount: number
  avgBidAccuracy: number | null
}

export type ManagerData = ManagerRecord[]
