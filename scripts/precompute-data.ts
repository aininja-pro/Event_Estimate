import * as fs from 'node:fs'
import * as path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.join(ROOT, 'src', 'data')

// Real data types (from Python extraction pipeline)
interface SectionInfo {
  canonical_name: string
  section_exists: boolean
  start_row: number
  total_row: number | null
  bid_total: number | null
  recap_total: number | null
}

interface LaborRole {
  role: string
  unit_rate: number
  gl_code: string | null
  cost_rate: number | null
  has_ot_variant: boolean
}

interface MasterRecord {
  // From Project List
  client?: string
  event_name?: string
  lead_office?: string
  status?: string
  event_manager?: string
  revenue_segment?: string
  event_start_date?: string
  event_end_date?: string
  // From scan
  filename: string
  format?: string
  grand_total: number | null
  sections: Record<string, SectionInfo>
  labor_roles: LaborRole[]
  has_recap_data: boolean
  join_status?: string
}

interface RateCardRecord {
  role: string
  rate_units: string[]
  gl_codes: string[]
  occurrences: number
  has_ot_variant: boolean
  has_dt_variant: boolean
  has_weekend_variant: boolean
  has_afterhours_variant: boolean
  unit_rate_range: { min: number; max: number; avg: number; median: number }
  unit_rate_range_raw: { min: number; max: number; avg: number; median: number }
  margin_range: { min: number; max: number; avg: number; median: number } | null
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

function parseDateToMonth(dateStr: string | undefined): string | null {
  if (!dateStr) return null
  // Try "YYYY-MM-DD" format first
  if (/^\d{4}-\d{2}/.test(dateStr)) return dateStr.slice(0, 7)
  // Try "Mon DD, YYYY" format (e.g. "Jun 27, 2023")
  const match = dateStr.match(/^(\w+)\s+(\d+),?\s+(\d{4})/)
  if (match) {
    const months: Record<string, string> = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
    }
    const m = months[match[1]]
    if (m) return `${match[3]}-${m}`
  }
  return null
}

function getSections(r: MasterRecord): Array<{ section_name: string; bid_total: number; recap_total: number | null }> {
  if (!r.sections || typeof r.sections !== 'object') return []
  return Object.entries(r.sections).map(([name, info]) => ({
    section_name: name,
    bid_total: info.bid_total ?? 0,
    recap_total: info.recap_total ?? null,
  }))
}

// Read source files
console.log('Reading source files...')
const masterIndex = readJSON<MasterRecord[]>('enriched_master_index.json')
const rateCard = readJSON<RateCardRecord[]>('rate_card_master.json')

console.log(`  ${masterIndex.length} records from enriched_master_index.json`)
console.log(`  ${rateCard.length} roles from rate_card_master.json`)
console.log()

// Ensure output directory exists
fs.mkdirSync(OUT_DIR, { recursive: true })

console.log('Generating pre-computed data files...\n')

// 1. Dashboard Executive Summary
function generateExecutiveSummary() {
  const eventsWithRevenue = masterIndex.filter(r => (r.grand_total ?? 0) > 0)
  const totalRevenue = round2(eventsWithRevenue.reduce((sum, r) => sum + (r.grand_total ?? 0), 0))
  const avgEventSize = eventsWithRevenue.length > 0 ? round2(totalRevenue / eventsWithRevenue.length) : 0
  const medianEventSize = round2(median(eventsWithRevenue.map(r => r.grand_total ?? 0)))
  const eventsWithRecap = masterIndex.filter(r => r.has_recap_data).length

  // Top clients by revenue
  const clientMap = new Map<string, { count: number; totalRevenue: number }>()
  for (const r of masterIndex) {
    const client = r.client ?? 'Unknown'
    const entry = clientMap.get(client) ?? { count: 0, totalRevenue: 0 }
    entry.count++
    entry.totalRevenue += r.grand_total ?? 0
    clientMap.set(client, entry)
  }
  const topClientsByRevenue = Array.from(clientMap.entries())
    .map(([name, d]) => ({ name, count: d.count, totalRevenue: round2(d.totalRevenue) }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10)

  // Top offices by volume
  const officeMap = new Map<string, { count: number; totalRevenue: number }>()
  for (const r of masterIndex) {
    const office = r.lead_office ?? 'Unknown'
    const entry = officeMap.get(office) ?? { count: 0, totalRevenue: 0 }
    entry.count++
    entry.totalRevenue += r.grand_total ?? 0
    officeMap.set(office, entry)
  }
  const topOfficesByVolume = Array.from(officeMap.entries())
    .map(([name, d]) => ({ name, count: d.count, totalRevenue: round2(d.totalRevenue) }))
    .sort((a, b) => b.count - a.count)

  // Status distribution
  const statusMap = new Map<string, number>()
  for (const r of masterIndex) {
    const status = r.status ?? 'Unknown'
    statusMap.set(status, (statusMap.get(status) ?? 0) + 1)
  }
  const statusDistribution = Array.from(statusMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Revenue segment distribution
  const segmentMap = new Map<string, { count: number; totalRevenue: number }>()
  for (const r of masterIndex) {
    const segment = r.revenue_segment ?? 'Unknown'
    const entry = segmentMap.get(segment) ?? { count: 0, totalRevenue: 0 }
    entry.count++
    entry.totalRevenue += r.grand_total ?? 0
    segmentMap.set(segment, entry)
  }
  const revenueSegmentDistribution = Array.from(segmentMap.entries())
    .map(([name, d]) => ({ name, count: d.count, totalRevenue: round2(d.totalRevenue) }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)

  // Events by month
  const monthMap = new Map<string, { count: number; revenue: number }>()
  for (const r of masterIndex) {
    const month = parseDateToMonth(r.event_start_date)
    if (!month) continue
    const entry = monthMap.get(month) ?? { count: 0, revenue: 0 }
    entry.count++
    entry.revenue += r.grand_total ?? 0
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
  // Per-section aggregates
  const sectionAggMap = new Map<string, {
    bidTotal: number
    actualTotal: number
    bidCount: number
    actualCount: number
  }>()

  for (const r of masterIndex) {
    for (const s of getSections(r)) {
      const entry = sectionAggMap.get(s.section_name) ?? {
        bidTotal: 0, actualTotal: 0, bidCount: 0, actualCount: 0,
      }
      entry.bidTotal += s.bid_total
      entry.bidCount++
      if (s.recap_total !== null && s.recap_total > 0) {
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
      avgBid: d.bidCount > 0 ? round2(d.bidTotal / d.bidCount) : 0,
      avgActual: d.actualCount > 0 ? round2(d.actualTotal / d.actualCount) : null,
      eventCount: d.bidCount,
      recapCount: d.actualCount,
    }))
    .sort((a, b) => b.totalBid - a.totalBid)

  // Grand total ranges for histogram
  const grandTotals = masterIndex
    .map(r => r.grand_total ?? 0)
    .filter(v => v > 0)
    .sort((a, b) => a - b)

  const ranges = [
    { label: 'Under $1K', min: 0, max: 1000 },
    { label: '$1K-$5K', min: 1000, max: 5000 },
    { label: '$5K-$10K', min: 5000, max: 10000 },
    { label: '$10K-$25K', min: 10000, max: 25000 },
    { label: '$25K-$50K', min: 25000, max: 50000 },
    { label: '$50K-$100K', min: 50000, max: 100000 },
    { label: '$100K+', min: 100000, max: Infinity },
  ]

  const grandTotalRanges = ranges.map(range => ({
    label: range.label,
    count: grandTotals.filter(v => v >= range.min && v < range.max).length,
  }))

  const recapCount = masterIndex.filter(r => r.has_recap_data).length

  // By client
  const clientMap = new Map<string, { count: number; totalRevenue: number }>()
  for (const r of masterIndex) {
    const client = r.client ?? 'Unknown'
    const entry = clientMap.get(client) ?? { count: 0, totalRevenue: 0 }
    entry.count++
    entry.totalRevenue += r.grand_total ?? 0
    clientMap.set(client, entry)
  }
  const byClient = Array.from(clientMap.entries())
    .map(([name, d]) => ({ name, count: d.count, totalRevenue: round2(d.totalRevenue) }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)

  // By office
  const officeMap = new Map<string, { count: number; totalRevenue: number }>()
  for (const r of masterIndex) {
    const office = r.lead_office ?? 'Unknown'
    const entry = officeMap.get(office) ?? { count: 0, totalRevenue: 0 }
    entry.count++
    entry.totalRevenue += r.grand_total ?? 0
    officeMap.set(office, entry)
  }
  const byLeadOffice = Array.from(officeMap.entries())
    .map(([name, d]) => ({ name, count: d.count, totalRevenue: round2(d.totalRevenue) }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)

  // By revenue segment
  const segmentMap = new Map<string, { count: number; totalRevenue: number }>()
  for (const r of masterIndex) {
    const segment = r.revenue_segment ?? 'Unknown'
    const entry = segmentMap.get(segment) ?? { count: 0, totalRevenue: 0 }
    entry.count++
    entry.totalRevenue += r.grand_total ?? 0
    segmentMap.set(segment, entry)
  }
  const byRevenueSegment = Array.from(segmentMap.entries())
    .map(([name, d]) => ({ name, count: d.count, totalRevenue: round2(d.totalRevenue) }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)

  // By status
  const statusMap = new Map<string, { count: number; totalRevenue: number }>()
  for (const r of masterIndex) {
    const status = r.status ?? 'Unknown'
    const entry = statusMap.get(status) ?? { count: 0, totalRevenue: 0 }
    entry.count++
    entry.totalRevenue += r.grand_total ?? 0
    statusMap.set(status, entry)
  }
  const byStatus = Array.from(statusMap.entries())
    .map(([name, d]) => ({ name, count: d.count, totalRevenue: round2(d.totalRevenue) }))

  // Section summary
  const sectionSummary = {
    totalEventsAnalyzed: masterIndex.length,
    sections: sectionAggregates.map(s => ({
      name: s.name,
      eventCount: s.eventCount,
      percentOfEvents: masterIndex.length > 0
        ? round2((s.eventCount / masterIndex.length) * 100)
        : 0,
    })),
  }

  return {
    grandTotalRanges,
    totalEvents: masterIndex.length,
    filesBidAndRecap: recapCount,
    byRevenueSegment,
    byClient,
    byLeadOffice,
    byStatus,
    sectionSummary,
    sectionAggregates,
  }
}

// 3. Dashboard Variance Analysis
function generateVarianceData() {
  const recapEvents = masterIndex.filter(r => r.has_recap_data)

  const eventVariances = recapEvents.flatMap(r => {
    const sections = getSections(r)
    // Only include sections that actually have recap data
    const recapSections = sections.filter(s => s.recap_total !== null && s.recap_total > 0)
    if (recapSections.length === 0) return []

    const grandTotalBid = round2(recapSections.reduce((sum, s) => sum + s.bid_total, 0))
    const grandTotalActual = round2(recapSections.reduce((sum, s) => sum + s.recap_total!, 0))
    const variance = round2(grandTotalActual - grandTotalBid)
    const variancePct = grandTotalBid !== 0 ? round2((variance / grandTotalBid) * 100) : 0

    const sectionVariances = recapSections.map(s => ({
      name: s.section_name,
      bid: s.bid_total,
      actual: s.recap_total!,
      variance: round2(s.recap_total! - s.bid_total),
      variancePct: s.bid_total !== 0
        ? round2(((s.recap_total! - s.bid_total) / s.bid_total) * 100)
        : 0,
    }))

    return [{
      event_name: r.event_name ?? r.filename,
      client: r.client ?? 'Unknown',
      lead_office: r.lead_office ?? 'Unknown',
      grandTotalBid,
      grandTotalActual,
      variance,
      variancePct,
      sectionVariances,
    }]
  })

  // Summary stats
  const variancePcts = eventVariances.map(e => e.variancePct).filter(v => isFinite(v))
  const avgVariancePct = variancePcts.length > 0
    ? round2(variancePcts.reduce((s, v) => s + v, 0) / variancePcts.length)
    : 0
  const medianVariancePct = round2(median(variancePcts))

  // By section
  const bySectionMap = new Map<string, { totalVariance: number; count: number; variances: number[] }>()
  for (const ev of eventVariances) {
    for (const sv of ev.sectionVariances) {
      const entry = bySectionMap.get(sv.name) ?? { totalVariance: 0, count: 0, variances: [] }
      entry.totalVariance += sv.variance
      entry.count++
      if (isFinite(sv.variancePct)) entry.variances.push(sv.variancePct)
      bySectionMap.set(sv.name, entry)
    }
  }
  const bySection = Array.from(bySectionMap.entries())
    .map(([name, d]) => ({
      name,
      avgVariancePct: d.variances.length > 0
        ? round2(d.variances.reduce((s, v) => s + v, 0) / d.variances.length)
        : 0,
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
    if (isFinite(ev.variancePct)) entry.variances.push(ev.variancePct)
    byClientMap.set(ev.client, entry)
  }
  const byClient = Array.from(byClientMap.entries())
    .map(([name, d]) => ({
      name,
      avgVariancePct: d.variances.length > 0
        ? round2(d.variances.reduce((s, v) => s + v, 0) / d.variances.length)
        : 0,
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
    if (isFinite(ev.variancePct)) entry.variances.push(ev.variancePct)
    byOfficeMap.set(ev.lead_office, entry)
  }
  const byOffice = Array.from(byOfficeMap.entries())
    .map(([name, d]) => ({
      name,
      avgVariancePct: d.variances.length > 0
        ? round2(d.variances.reduce((s, v) => s + v, 0) / d.variances.length)
        : 0,
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
      count: eventVariances.length,
    },
    bySection,
    byClient,
    byOffice,
    events: topEvents,
  }
}

// 4. Dashboard Manager Performance

// Normalize inconsistent event manager names from the Project List.
// Keys are lowercased/trimmed variants; values are the canonical name.
const MANAGER_NAME_MAP: Record<string, string> = {
  // Mark Duffus variants
  'duffus': 'Mark Duffus',
  'dufffus': 'Mark Duffus',
  'mark duffus': 'Mark Duffus',
  'mark duffas': 'Mark Duffus',
  // Johnny Tapanes variants
  'johnny tapanes': 'Johnny Tapanes',
  'johnny tapenas': 'Johnny Tapanes',
  'johnny tapanese': 'Johnny Tapanes',
  'johnnytapanes': 'Johnny Tapanes',
  'johnnytapenas': 'Johnny Tapanes',
  'johnny tapanas': 'Johnny Tapanes',
  'johnny tapenes': 'Johnny Tapanes',
  // Chris Ruballos variants
  'chris ruballos': 'Chris Ruballos',
  'chris rubellos': 'Chris Ruballos',
  'chis ruballos': 'Chris Ruballos',
  'chris rubllos': 'Chris Ruballos',
  // Rafael Rivera variants
  'rafael rivera': 'Rafael Rivera',
  'rafael riveria': 'Rafael Rivera',
  'rafale rivera': 'Rafael Rivera',
  // Matt Hruska variants
  'matt hruska': 'Matt Hruska',
  'matthew hruska': 'Matt Hruska',
  // Aaron Hansen variants
  'aaron hanson': 'Aaron Hansen',
  // Summer Stacey variants
  'summer stacy': 'Summer Stacey',
  // Josh Plies variants
  'josh piles': 'Josh Plies',
  // Office name misattributed as a person
  'los angeles': 'Unassigned (Los Angeles)',
  // Multi-person entries — normalize to consistent format
  'eric goetz, aaron hansen': 'Eric Goetz, Aaron Hansen',
  'aaron hansen, eric goetz': 'Eric Goetz, Aaron Hansen',
  'eric goetz / aaron hansen': 'Eric Goetz, Aaron Hansen',
  'eric goetz/aaron hansen': 'Eric Goetz, Aaron Hansen',
  'aaron hansen/eric goetz': 'Eric Goetz, Aaron Hansen',
  'aaron hansen / eric goetz': 'Eric Goetz, Aaron Hansen',
  'chris / rafael': 'Chris Ruballos, Rafael Rivera',
  'chris /rafael': 'Chris Ruballos, Rafael Rivera',
  'rafael/chris': 'Rafael Rivera, Chris Ruballos',
  'rafael/chrs': 'Rafael Rivera, Chris Ruballos',
  'rafael rivera/chris ruballos': 'Chris Ruballos, Rafael Rivera',
  'rafael rivera/chris rubellos': 'Chris Ruballos, Rafael Rivera',
  'rafael and chris': 'Rafael Rivera, Chris Ruballos',
  'bill hahn/ matt hruska': 'Bill Hahn, Matt Hruska',
  'matt hruska and bill hahn': 'Bill Hahn, Matt Hruska',
  'johnny and summer': 'Johnny Tapanes, Summer Stacey',
  'josh, eric': 'Josh Plies, Eric Goetz',
  'josh piles, eric goetz': 'Josh Plies, Eric Goetz',
  'eric goetz, josh plies': 'Eric Goetz, Josh Plies',
  'eric goetz, aaron hansen, johnny tapanes': 'Eric Goetz, Aaron Hansen, Johnny Tapanes',
  'john / jennifer harper': 'John Harper, Jennifer Harper',
  'matt hruska and tony giacalone': 'Matt Hruska, Tony Giacalone',
  'matt hruska and friends': 'Matt Hruska',
  'aaron hansen (and others)': 'Aaron Hansen',
}

function normalizeManagerName(raw: string): string {
  const key = raw.trim().toLowerCase()
  return MANAGER_NAME_MAP[key] ?? raw.trim()
}

function generateManagerData() {
  const managerMap = new Map<string, {
    eventCount: number
    totalRevenue: number
    clients: Set<string>
    recapEvents: Array<{ bidTotal: number; actualTotal: number }>
  }>()

  for (const r of masterIndex) {
    const rawManager = r.event_manager
    if (!rawManager) continue
    const manager = normalizeManagerName(rawManager)
    const entry = managerMap.get(manager) ?? {
      eventCount: 0,
      totalRevenue: 0,
      clients: new Set<string>(),
      recapEvents: [],
    }
    entry.eventCount++
    entry.totalRevenue += r.grand_total ?? 0
    entry.clients.add(r.client ?? 'Unknown')

    if (r.has_recap_data) {
      const sections = getSections(r)
      const recapSections = sections.filter(s => s.recap_total !== null && s.recap_total > 0)
      if (recapSections.length > 0) {
        const bidTotal = recapSections.reduce((sum, s) => sum + s.bid_total, 0)
        const actualTotal = recapSections.reduce((sum, s) => sum + s.recap_total!, 0)
        entry.recapEvents.push({ bidTotal, actualTotal })
      }
    }
    managerMap.set(manager, entry)
  }

  const managers = Array.from(managerMap.entries())
    .map(([name, d]) => {
      let avgBidAccuracy: number | null = null
      if (d.recapEvents.length > 0) {
        const accuracies = d.recapEvents
          .filter(e => e.bidTotal !== 0)
          .map(e => e.actualTotal / e.bidTotal)
        if (accuracies.length > 0) {
          avgBidAccuracy = round2(
            accuracies.reduce((s, v) => s + v, 0) / accuracies.length,
          )
        }
      }

      return {
        name,
        eventCount: d.eventCount,
        totalRevenue: round2(d.totalRevenue),
        avgEventSize: d.eventCount > 0 ? round2(d.totalRevenue / d.eventCount) : 0,
        clientsServed: d.clients.size,
        recapEventCount: d.recapEvents.length,
        avgBidAccuracy,
      }
    })
    .sort((a, b) => b.eventCount - a.eventCount)

  return managers
}

// 5. Rate Card (pass through, ensure nulls have defaults)
function generateRateCard() {
  return rateCard.map(r => ({
    ...r,
    margin_range: r.margin_range ?? { min: 0, max: 0, avg: 0, median: 0 },
  }))
}

// 6. AI Context
function generateAIContext() {
  const allDates = masterIndex
    .map(r => r.event_start_date)
    .filter((d): d is string => !!d)
    .sort()

  // Section cost averages
  const sectionCosts = new Map<string, { bids: number[]; actuals: number[] }>()
  for (const r of masterIndex) {
    for (const s of getSections(r)) {
      const entry = sectionCosts.get(s.section_name) ?? { bids: [], actuals: [] }
      entry.bids.push(s.bid_total)
      if (s.recap_total !== null && s.recap_total > 0) entry.actuals.push(s.recap_total)
      sectionCosts.set(s.section_name, entry)
    }
  }
  const sectionStats = Array.from(sectionCosts.entries())
    .map(([name, d]) => ({
      name,
      avgBid: d.bids.length > 0 ? round2(d.bids.reduce((s, v) => s + v, 0) / d.bids.length) : 0,
      avgActual: d.actuals.length > 0
        ? round2(d.actuals.reduce((s, v) => s + v, 0) / d.actuals.length)
        : null,
    }))
    .sort((a, b) => b.avgBid - a.avgBid)

  // Common roles with rate ranges
  const commonRoles = [...rateCard]
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
    const segment = r.revenue_segment ?? 'Unknown'
    const entry = segmentMap.get(segment) ?? { total: 0, count: 0 }
    entry.total += r.grand_total ?? 0
    entry.count++
    segmentMap.set(segment, entry)
  }
  const avgEventSizeBySegment = Array.from(segmentMap.entries())
    .map(([name, d]) => ({
      name,
      avgSize: d.count > 0 ? round2(d.total / d.count) : 0,
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
writeJSON('rate-card.json', generateRateCard())
writeJSON('ai-context.json', generateAIContext())

// Print total size
const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.json'))
const totalSize = files.reduce((sum, f) => {
  return sum + fs.statSync(path.join(OUT_DIR, f)).size
}, 0)

console.log(`\nTotal src/data/ size: ${(totalSize / 1024).toFixed(1)} KB`)
console.log('Pre-computation complete.')
