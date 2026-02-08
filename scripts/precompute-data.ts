import * as fs from 'node:fs'
import * as path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.join(ROOT, 'src', 'data')

interface MasterRecord {
  client: string
  event_name: string
  lead_office: string
  status: string
  event_manager: string
  revenue_segment: string
  event_start_date: string
  event_end_date: string
  grand_total: number
  sections: Array<{
    section_name: string
    bid_total: number
    recap_total: number | null
  }>
  labor_roles: Array<{
    role: string
    unit_rate: number
    gl_code: string
  }>
  has_recap_data: boolean
  agency_fees: number
  other_production_costs: number
}

interface RateCardRecord {
  role: string
  gl_codes: string[]
  occurrences: number
  has_ot_variant: boolean
  unit_rate_range: { min: number; max: number; avg: number; median: number }
  cost_rate_range: { min: number; max: number; avg: number; median: number }
}

interface FinancialSummaryData {
  grandTotalRanges: Array<{ label: string; count: number }>
  totalEvents: number
  filesBidAndRecap: number
  byRevenueSegment: Array<{ name: string; count: number; totalRevenue: number }>
  byClient: Array<{ name: string; count: number; totalRevenue: number }>
  byLeadOffice: Array<{ name: string; count: number; totalRevenue: number }>
  byStatus: Array<{ name: string; count: number; totalRevenue: number }>
}

interface SectionSummaryData {
  totalEventsAnalyzed: number
  sections: Array<{ name: string; eventCount: number; percentOfEvents: number }>
}

function readJSON<T>(filename: string): T {
  const filePath = path.join(ROOT, filename)
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: ${filename} not found at ${filePath}`)
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

function writeJSON(filename: string, data: unknown): void {
  const filePath = path.join(OUT_DIR, filename)
  const content = JSON.stringify(data)
  fs.writeFileSync(filePath, content, 'utf-8')
  const size = Buffer.byteLength(content)
  const sizeStr = size > 1024
    ? `${(size / 1024).toFixed(1)} KB`
    : `${size} B`
  console.log(`  ${filename}: ${sizeStr}`)
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Read source files
console.log('Reading source files...')
const masterIndex = readJSON<MasterRecord[]>('enriched_master_index.json')
const rateCard = readJSON<RateCardRecord[]>('rate_card_master.json')
const financialSummary = readJSON<FinancialSummaryData>('financial_summary.json')
const sectionSummary = readJSON<SectionSummaryData>('section_summary.json')

console.log(`  ${masterIndex.length} records from enriched_master_index.json`)
console.log(`  ${rateCard.length} roles from rate_card_master.json`)
console.log()

// Ensure output directory exists
fs.mkdirSync(OUT_DIR, { recursive: true })

console.log('Generating pre-computed data files...\n')

// 1. Dashboard Executive Summary
function generateExecutiveSummary() {
  const eventsWithRevenue = masterIndex.filter(r => r.grand_total > 0)
  const totalRevenue = round2(eventsWithRevenue.reduce((sum, r) => sum + r.grand_total, 0))
  const avgEventSize = round2(totalRevenue / eventsWithRevenue.length)
  const medianEventSize = round2(median(eventsWithRevenue.map(r => r.grand_total)))
  const eventsWithRecap = masterIndex.filter(r => r.has_recap_data).length

  // Top clients by revenue
  const clientMap = new Map<string, { count: number; totalRevenue: number }>()
  for (const r of masterIndex) {
    const entry = clientMap.get(r.client) ?? { count: 0, totalRevenue: 0 }
    entry.count++
    entry.totalRevenue += r.grand_total
    clientMap.set(r.client, entry)
  }
  const topClientsByRevenue = Array.from(clientMap.entries())
    .map(([name, d]) => ({ name, count: d.count, totalRevenue: round2(d.totalRevenue) }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10)

  // Top offices by volume
  const officeMap = new Map<string, { count: number; totalRevenue: number }>()
  for (const r of masterIndex) {
    const entry = officeMap.get(r.lead_office) ?? { count: 0, totalRevenue: 0 }
    entry.count++
    entry.totalRevenue += r.grand_total
    officeMap.set(r.lead_office, entry)
  }
  const topOfficesByVolume = Array.from(officeMap.entries())
    .map(([name, d]) => ({ name, count: d.count, totalRevenue: round2(d.totalRevenue) }))
    .sort((a, b) => b.count - a.count)

  // Status distribution
  const statusMap = new Map<string, number>()
  for (const r of masterIndex) {
    statusMap.set(r.status, (statusMap.get(r.status) ?? 0) + 1)
  }
  const statusDistribution = Array.from(statusMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Revenue segment distribution
  const segmentMap = new Map<string, { count: number; totalRevenue: number }>()
  for (const r of masterIndex) {
    const entry = segmentMap.get(r.revenue_segment) ?? { count: 0, totalRevenue: 0 }
    entry.count++
    entry.totalRevenue += r.grand_total
    segmentMap.set(r.revenue_segment, entry)
  }
  const revenueSegmentDistribution = Array.from(segmentMap.entries())
    .map(([name, d]) => ({ name, count: d.count, totalRevenue: round2(d.totalRevenue) }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)

  // Events by month
  const monthMap = new Map<string, { count: number; revenue: number }>()
  for (const r of masterIndex) {
    if (!r.event_start_date) continue
    const month = r.event_start_date.slice(0, 7)
    const entry = monthMap.get(month) ?? { count: 0, revenue: 0 }
    entry.count++
    entry.revenue += r.grand_total
    monthMap.set(month, entry)
  }
  const eventsByMonth = Array.from(monthMap.entries())
    .map(([month, d]) => ({ month, count: d.count, revenue: round2(d.revenue) }))
    .sort((a, b) => a.month.localeCompare(b.month))

  return {
    totalEvents: masterIndex.length,
    totalRevenue,
    avgEventSize,
    medianEventSize,
    eventsWithRecap,
    topClientsByRevenue,
    topOfficesByVolume,
    statusDistribution,
    revenueSegmentDistribution,
    eventsByMonth,
  }
}

// 2. Dashboard Cost Analysis
function generateCostAnalysis() {
  // Per-section aggregates from master index
  const sectionAggMap = new Map<string, {
    bidTotal: number
    actualTotal: number
    bidCount: number
    actualCount: number
  }>()

  for (const r of masterIndex) {
    for (const s of r.sections) {
      const entry = sectionAggMap.get(s.section_name) ?? {
        bidTotal: 0, actualTotal: 0, bidCount: 0, actualCount: 0,
      }
      entry.bidTotal += s.bid_total
      entry.bidCount++
      if (s.recap_total !== null) {
        entry.actualTotal += s.recap_total
        entry.actualCount++
      }
      sectionAggMap.set(s.section_name, entry)
    }
  }

  const sectionAggregates = Array.from(sectionAggMap.entries())
    .map(([name, d]) => ({
      name,
      totalBid: round2(d.bidTotal),
      totalActual: round2(d.actualTotal),
      avgBid: round2(d.bidTotal / d.bidCount),
      avgActual: d.actualCount > 0 ? round2(d.actualTotal / d.actualCount) : null,
      eventCount: d.bidCount,
      recapCount: d.actualCount,
    }))
    .sort((a, b) => b.totalBid - a.totalBid)

  return {
    ...financialSummary,
    sectionSummary,
    sectionAggregates,
  }
}

// 3. Dashboard Variance Analysis
function generateVarianceData() {
  const recapEvents = masterIndex.filter(r => r.has_recap_data)

  const eventVariances = recapEvents.map(r => {
    const grandTotalBid = round2(r.sections.reduce((sum, s) => sum + s.bid_total, 0))
    const grandTotalActual = round2(
      r.sections.reduce((sum, s) => sum + (s.recap_total ?? s.bid_total), 0),
    )
    const variance = round2(grandTotalActual - grandTotalBid)
    const variancePct = grandTotalBid !== 0 ? round2((variance / grandTotalBid) * 100) : 0

    const sectionVariances = r.sections
      .filter(s => s.recap_total !== null)
      .map(s => ({
        name: s.section_name,
        bid: s.bid_total,
        actual: s.recap_total!,
        variance: round2(s.recap_total! - s.bid_total),
        variancePct: s.bid_total !== 0
          ? round2(((s.recap_total! - s.bid_total) / s.bid_total) * 100)
          : 0,
      }))

    return {
      event_name: r.event_name,
      client: r.client,
      lead_office: r.lead_office,
      grandTotalBid,
      grandTotalActual,
      variance,
      variancePct,
      sectionVariances,
    }
  })

  // Summary stats
  const variancePcts = eventVariances.map(e => e.variancePct)
  const avgVariancePct = round2(variancePcts.reduce((s, v) => s + v, 0) / variancePcts.length)
  const medianVariancePct = round2(median(variancePcts))

  // By section
  const bySectionMap = new Map<string, { totalVariance: number; count: number; variances: number[] }>()
  for (const ev of eventVariances) {
    for (const sv of ev.sectionVariances) {
      const entry = bySectionMap.get(sv.name) ?? { totalVariance: 0, count: 0, variances: [] }
      entry.totalVariance += sv.variance
      entry.count++
      entry.variances.push(sv.variancePct)
      bySectionMap.set(sv.name, entry)
    }
  }
  const bySection = Array.from(bySectionMap.entries())
    .map(([name, d]) => ({
      name,
      avgVariancePct: round2(d.variances.reduce((s, v) => s + v, 0) / d.variances.length),
      totalOverUnder: round2(d.totalVariance),
      eventCount: d.count,
    }))
    .sort((a, b) => Math.abs(b.totalOverUnder) - Math.abs(a.totalOverUnder))

  // By client
  const byClientMap = new Map<string, { totalVariance: number; count: number; variances: number[] }>()
  for (const ev of eventVariances) {
    const entry = byClientMap.get(ev.client) ?? { totalVariance: 0, count: 0, variances: [] }
    entry.totalVariance += ev.variance
    entry.count++
    entry.variances.push(ev.variancePct)
    byClientMap.set(ev.client, entry)
  }
  const byClient = Array.from(byClientMap.entries())
    .map(([name, d]) => ({
      name,
      avgVariancePct: round2(d.variances.reduce((s, v) => s + v, 0) / d.variances.length),
      totalOverUnder: round2(d.totalVariance),
      eventCount: d.count,
    }))
    .sort((a, b) => b.totalOverUnder - a.totalOverUnder)

  // By office
  const byOfficeMap = new Map<string, { totalVariance: number; count: number; variances: number[] }>()
  for (const ev of eventVariances) {
    const entry = byOfficeMap.get(ev.lead_office) ?? { totalVariance: 0, count: 0, variances: [] }
    entry.totalVariance += ev.variance
    entry.count++
    entry.variances.push(ev.variancePct)
    byOfficeMap.set(ev.lead_office, entry)
  }
  const byOffice = Array.from(byOfficeMap.entries())
    .map(([name, d]) => ({
      name,
      avgVariancePct: round2(d.variances.reduce((s, v) => s + v, 0) / d.variances.length),
      totalOverUnder: round2(d.totalVariance),
      eventCount: d.count,
    }))
    .sort((a, b) => b.totalOverUnder - a.totalOverUnder)

  // Top 50 events by absolute variance
  const topEvents = [...eventVariances]
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, 50)
    .map(ev => ({
      event_name: ev.event_name,
      client: ev.client,
      lead_office: ev.lead_office,
      grandTotalBid: ev.grandTotalBid,
      grandTotalActual: ev.grandTotalActual,
      variance: ev.variance,
      variancePct: ev.variancePct,
    }))

  return {
    summary: {
      avgVariancePct,
      medianVariancePct,
      count: recapEvents.length,
    },
    bySection,
    byClient,
    byOffice,
    events: topEvents,
  }
}

// 4. Dashboard Manager Performance
function generateManagerData() {
  const managerMap = new Map<string, {
    eventCount: number
    totalRevenue: number
    clients: Set<string>
    recapEvents: Array<{ bidTotal: number; actualTotal: number }>
  }>()

  for (const r of masterIndex) {
    if (!r.event_manager) continue
    const entry = managerMap.get(r.event_manager) ?? {
      eventCount: 0,
      totalRevenue: 0,
      clients: new Set<string>(),
      recapEvents: [],
    }
    entry.eventCount++
    entry.totalRevenue += r.grand_total
    entry.clients.add(r.client)

    if (r.has_recap_data) {
      const bidTotal = r.sections.reduce((sum, s) => sum + s.bid_total, 0)
      const actualTotal = r.sections.reduce((sum, s) => sum + (s.recap_total ?? s.bid_total), 0)
      entry.recapEvents.push({ bidTotal, actualTotal })
    }
    managerMap.set(r.event_manager, entry)
  }

  const managers = Array.from(managerMap.entries())
    .map(([name, d]) => {
      let avgBidAccuracy: number | null = null
      if (d.recapEvents.length > 0) {
        const accuracies = d.recapEvents.map(e =>
          e.bidTotal !== 0 ? e.actualTotal / e.bidTotal : 1,
        )
        avgBidAccuracy = round2(
          accuracies.reduce((s, v) => s + v, 0) / accuracies.length,
        )
      }

      return {
        name,
        eventCount: d.eventCount,
        totalRevenue: round2(d.totalRevenue),
        avgEventSize: round2(d.totalRevenue / d.eventCount),
        clientsServed: d.clients.size,
        recapEventCount: d.recapEvents.length,
        avgBidAccuracy,
      }
    })
    .sort((a, b) => b.eventCount - a.eventCount)

  return managers
}

// 5. AI Context
function generateAIContext() {
  const allDates = masterIndex
    .map(r => r.event_start_date)
    .filter(Boolean)
    .sort()

  // Section cost averages
  const sectionCosts = new Map<string, { bids: number[]; actuals: number[] }>()
  for (const r of masterIndex) {
    for (const s of r.sections) {
      const entry = sectionCosts.get(s.section_name) ?? { bids: [], actuals: [] }
      entry.bids.push(s.bid_total)
      if (s.recap_total !== null) entry.actuals.push(s.recap_total)
      sectionCosts.set(s.section_name, entry)
    }
  }
  const sectionStats = Array.from(sectionCosts.entries())
    .map(([name, d]) => ({
      name,
      avgBid: round2(d.bids.reduce((s, v) => s + v, 0) / d.bids.length),
      avgActual: d.actuals.length > 0
        ? round2(d.actuals.reduce((s, v) => s + v, 0) / d.actuals.length)
        : null,
    }))
    .sort((a, b) => b.avgBid - a.avgBid)

  // Common roles with rate ranges
  const commonRoles = rateCard
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 20)
    .map(r => ({
      role: r.role,
      rateMin: r.unit_rate_range.min,
      rateMax: r.unit_rate_range.max,
      rateAvg: r.unit_rate_range.avg,
      occurrences: r.occurrences,
    }))

  // Revenue segments with avg size
  const segmentMap = new Map<string, { total: number; count: number }>()
  for (const r of masterIndex) {
    const entry = segmentMap.get(r.revenue_segment) ?? { total: 0, count: 0 }
    entry.total += r.grand_total
    entry.count++
    segmentMap.set(r.revenue_segment, entry)
  }
  const avgEventSizeBySegment = Array.from(segmentMap.entries())
    .map(([name, d]) => ({
      name,
      avgSize: round2(d.total / d.count),
      count: d.count,
    }))

  return {
    totalEvents: masterIndex.length,
    eventsWithRecap: masterIndex.filter(r => r.has_recap_data).length,
    dateRange: {
      earliest: allDates[0] ?? null,
      latest: allDates[allDates.length - 1] ?? null,
    },
    sections: sectionStats,
    commonRoles,
    revenueSegments: avgEventSizeBySegment,
  }
}

// Generate all files
writeJSON('dashboard-executive.json', generateExecutiveSummary())
writeJSON('dashboard-costs.json', generateCostAnalysis())
writeJSON('dashboard-variance.json', generateVarianceData())
writeJSON('dashboard-managers.json', generateManagerData())
writeJSON('rate-card.json', rateCard)
writeJSON('ai-context.json', generateAIContext())

// Print total size
const dataDir = OUT_DIR
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))
const totalSize = files.reduce((sum, f) => {
  return sum + fs.statSync(path.join(dataDir, f)).size
}, 0)

console.log(`\nTotal src/data/ size: ${(totalSize / 1024).toFixed(1)} KB`)
console.log('Pre-computation complete.')
