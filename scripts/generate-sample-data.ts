import * as fs from 'node:fs'
import * as path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

const clients = [
  'BMW', 'Mercedes-Benz', 'Porsche', 'Audi', 'Volkswagen',
  'Toyota', 'Lexus', 'Honda', 'Acura', 'Nissan',
  'Infiniti', 'Mazda', 'Subaru', 'Hyundai', 'Kia',
  'Genesis', 'Ford', 'Lincoln', 'Chevrolet', 'Cadillac',
  'Jeep', 'Ram', 'Dodge', 'Chrysler', 'Rivian',
  'Lucid', 'Volvo', 'Land Rover', 'Jaguar', 'Mini',
]

const offices = [
  'Detroit', 'Los Angeles', 'New York', 'Chicago', 'Dallas',
  'Atlanta', 'Denver', 'Miami', 'San Francisco', 'Seattle',
  'Boston', 'Phoenix', 'Nashville', 'Portland', 'Charlotte',
]

const statuses = ['Won', 'Won', 'Won', 'Won', 'Lost', 'Pending', 'Cancelled']

const revenueSegments = [
  'Tier 1 ($100K+)', 'Tier 2 ($50K-$100K)', 'Tier 3 ($25K-$50K)',
  'Tier 4 ($10K-$25K)', 'Tier 5 (Under $10K)',
]

const eventManagers = [
  'Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'David Kim',
  'Jessica Taylor', 'Chris Anderson', 'Amanda White', 'Ryan Martinez',
  'Lisa Brown', 'Tom Wilson', 'Karen Davis', 'James Moore',
  'Nicole Jackson', 'Kevin Lee', 'Rachel Thompson', 'Brian Harris',
  'Stephanie Clark', 'Daniel Lewis', 'Michelle Walker', 'Andrew Hall',
]

const sections = [
  'PLANNING & ADMINISTRATION',
  'ACCESS/SPONSORSHIP FEES',
  'ONSITE LABOR ACTIVITY',
  'TRAVEL EXPENSES',
  'CREATIVE COSTS',
  'PRODUCTION EXPENSES',
  'LOGISTICS EXPENSES',
]

const roles = [
  { role: 'Event Manager', glCodes: ['5100'], unitRateMin: 850, unitRateMax: 1200 },
  { role: 'Brand Ambassador', glCodes: ['5200'], unitRateMin: 250, unitRateMax: 450 },
  { role: 'Product Specialist', glCodes: ['5210'], unitRateMin: 350, unitRateMax: 550 },
  { role: 'Team Lead', glCodes: ['5110'], unitRateMin: 650, unitRateMax: 900 },
  { role: 'Site Manager', glCodes: ['5120'], unitRateMin: 750, unitRateMax: 1050 },
  { role: 'Driver', glCodes: ['5300'], unitRateMin: 300, unitRateMax: 500 },
  { role: 'Logistics Coordinator', glCodes: ['5400'], unitRateMin: 450, unitRateMax: 700 },
  { role: 'Registration Staff', glCodes: ['5220'], unitRateMin: 200, unitRateMax: 350 },
  { role: 'Setup Crew', glCodes: ['5310'], unitRateMin: 200, unitRateMax: 350 },
  { role: 'Photographer', glCodes: ['5500'], unitRateMin: 500, unitRateMax: 800 },
  { role: 'Videographer', glCodes: ['5510'], unitRateMin: 600, unitRateMax: 900 },
  { role: 'Graphic Designer', glCodes: ['5520'], unitRateMin: 500, unitRateMax: 750 },
  { role: 'Social Media Manager', glCodes: ['5530'], unitRateMin: 400, unitRateMax: 650 },
  { role: 'Production Manager', glCodes: ['5130'], unitRateMin: 700, unitRateMax: 1000 },
  { role: 'Technical Director', glCodes: ['5140'], unitRateMin: 800, unitRateMax: 1100 },
  { role: 'AV Technician', glCodes: ['5320'], unitRateMin: 350, unitRateMax: 550 },
  { role: 'Catering Coordinator', glCodes: ['5410'], unitRateMin: 350, unitRateMax: 500 },
  { role: 'Security Staff', glCodes: ['5230'], unitRateMin: 250, unitRateMax: 400 },
  { role: 'Valet', glCodes: ['5240'], unitRateMin: 200, unitRateMax: 300 },
  { role: 'Guest Services', glCodes: ['5250'], unitRateMin: 200, unitRateMax: 350 },
  { role: 'Warehouse Associate', glCodes: ['5420'], unitRateMin: 200, unitRateMax: 300 },
  { role: 'Fleet Coordinator', glCodes: ['5430'], unitRateMin: 450, unitRateMax: 650 },
  { role: 'Travel Coordinator', glCodes: ['5440'], unitRateMin: 400, unitRateMax: 600 },
  { role: 'Creative Director', glCodes: ['5540'], unitRateMin: 900, unitRateMax: 1300 },
  { role: 'Copywriter', glCodes: ['5550'], unitRateMin: 400, unitRateMax: 650 },
  { role: 'Event Coordinator', glCodes: ['5150'], unitRateMin: 500, unitRateMax: 750 },
  { role: 'Assistant Event Manager', glCodes: ['5160'], unitRateMin: 550, unitRateMax: 800 },
  { role: 'Field Manager', glCodes: ['5170'], unitRateMin: 600, unitRateMax: 850 },
  { role: 'Client Services Manager', glCodes: ['5180'], unitRateMin: 700, unitRateMax: 950 },
  { role: 'Data Entry Clerk', glCodes: ['5260'], unitRateMin: 175, unitRateMax: 275 },
]

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1))
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function genDate(yearMin: number, yearMax: number): string {
  const year = randInt(yearMin, yearMax)
  const month = randInt(1, 12)
  const day = randInt(1, 28)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function generateMasterIndex(): unknown[] {
  const records: unknown[] = []

  for (let i = 0; i < 1659; i++) {
    const client = pick(clients)
    const office = pick(offices)
    const status = pick(statuses)
    const manager = pick(eventManagers)
    const segment = pick(revenueSegments)
    const startDate = genDate(2018, 2025)
    const endParts = startDate.split('-')
    const endDay = Math.min(28, parseInt(endParts[2]) + randInt(1, 14))
    const endDate = `${endParts[0]}-${endParts[1]}-${String(endDay).padStart(2, '0')}`

    const hasRecap = Math.random() < 0.6
    const numSections = randInt(2, 7)
    const eventSections = pickN(sections, numSections)

    const sectionData = eventSections.map(name => {
      const bidTotal = Math.round(rand(500, 80000) * 100) / 100
      const variancePct = hasRecap ? rand(-0.3, 0.4) : 0
      const recapTotal = hasRecap ? Math.round(bidTotal * (1 + variancePct) * 100) / 100 : null
      return {
        section_name: name,
        bid_total: bidTotal,
        recap_total: recapTotal,
      }
    })

    const grandTotal = Math.round(sectionData.reduce((sum, s) => sum + s.bid_total, 0) * 100) / 100

    const numRoles = randInt(1, 6)
    const eventRoles = pickN(roles, numRoles).map(r => ({
      role: r.role,
      unit_rate: Math.round(rand(r.unitRateMin, r.unitRateMax) * 100) / 100,
      gl_code: r.glCodes[0],
    }))

    const agencyFees = Math.random() < 0.7 ? Math.round(rand(500, 15000) * 100) / 100 : 0
    const otherCosts = Math.random() < 0.5 ? Math.round(rand(200, 8000) * 100) / 100 : 0

    const eventNames = [
      `${client} Auto Show ${startDate.slice(0, 4)}`,
      `${client} Drive Experience`,
      `${client} Launch Event`,
      `${client} Dealer Meeting`,
      `${client} Brand Activation`,
      `${client} Test Drive Program`,
      `${client} VIP Experience`,
      `${client} Regional Tour`,
    ]

    records.push({
      client,
      event_name: pick(eventNames),
      lead_office: office,
      status,
      event_manager: manager,
      revenue_segment: segment,
      event_start_date: startDate,
      event_end_date: endDate,
      grand_total: grandTotal,
      sections: sectionData,
      labor_roles: eventRoles,
      has_recap_data: hasRecap,
      agency_fees: agencyFees,
      other_production_costs: otherCosts,
    })
  }

  return records
}

function generateRateCard(): unknown[] {
  return roles.map(r => {
    const occurrences = randInt(5, 200)
    const rates = Array.from({ length: occurrences }, () => rand(r.unitRateMin, r.unitRateMax))
    rates.sort((a, b) => a - b)
    const avg = rates.reduce((s, v) => s + v, 0) / rates.length
    const median = rates[Math.floor(rates.length / 2)]
    const hasOt = Math.random() < 0.4

    const costRates = rates.map(r => r * rand(0.5, 0.7))
    const costAvg = costRates.reduce((s, v) => s + v, 0) / costRates.length
    const costMedian = costRates[Math.floor(costRates.length / 2)]

    return {
      role: r.role,
      gl_codes: r.glCodes,
      occurrences,
      has_ot_variant: hasOt,
      unit_rate_range: {
        min: Math.round(rates[0] * 100) / 100,
        max: Math.round(rates[rates.length - 1] * 100) / 100,
        avg: Math.round(avg * 100) / 100,
        median: Math.round(median * 100) / 100,
      },
      cost_rate_range: {
        min: Math.round(costRates[0] * 100) / 100,
        max: Math.round(costRates[costRates.length - 1] * 100) / 100,
        avg: Math.round(costAvg * 100) / 100,
        median: Math.round(costMedian * 100) / 100,
      },
    }
  })
}

function generateFinancialSummary(records: unknown[]): unknown {
  const data = records as Array<{
    client: string
    lead_office: string
    revenue_segment: string
    status: string
    grand_total: number
  }>

  const grandTotals = data.map(r => r.grand_total).filter(v => v > 0)
  grandTotals.sort((a, b) => a - b)

  const byClient: Record<string, { count: number; totalRevenue: number }> = {}
  const byOffice: Record<string, { count: number; totalRevenue: number }> = {}
  const bySegment: Record<string, { count: number; totalRevenue: number }> = {}
  const byStatus: Record<string, { count: number; totalRevenue: number }> = {}

  for (const r of data) {
    if (!byClient[r.client]) byClient[r.client] = { count: 0, totalRevenue: 0 }
    byClient[r.client].count++
    byClient[r.client].totalRevenue += r.grand_total

    if (!byOffice[r.lead_office]) byOffice[r.lead_office] = { count: 0, totalRevenue: 0 }
    byOffice[r.lead_office].count++
    byOffice[r.lead_office].totalRevenue += r.grand_total

    if (!bySegment[r.revenue_segment]) bySegment[r.revenue_segment] = { count: 0, totalRevenue: 0 }
    bySegment[r.revenue_segment].count++
    bySegment[r.revenue_segment].totalRevenue += r.grand_total

    if (!byStatus[r.status]) byStatus[r.status] = { count: 0, totalRevenue: 0 }
    byStatus[r.status].count++
    byStatus[r.status].totalRevenue += r.grand_total
  }

  const ranges = [
    { label: 'Under $10K', min: 0, max: 10000 },
    { label: '$10K-$25K', min: 10000, max: 25000 },
    { label: '$25K-$50K', min: 25000, max: 50000 },
    { label: '$50K-$100K', min: 50000, max: 100000 },
    { label: '$100K+', min: 100000, max: Infinity },
  ]

  const grandTotalRanges = ranges.map(range => ({
    label: range.label,
    count: grandTotals.filter(v => v >= range.min && v < range.max).length,
  }))

  const recapCount = (data as Array<{ has_recap_data: boolean }>).filter(r => r.has_recap_data).length

  return {
    grandTotalRanges,
    totalEvents: data.length,
    filesBidAndRecap: recapCount,
    byRevenueSegment: Object.entries(bySegment).map(([name, d]) => ({
      name,
      count: d.count,
      totalRevenue: Math.round(d.totalRevenue * 100) / 100,
    })),
    byClient: Object.entries(byClient)
      .map(([name, d]) => ({
        name,
        count: d.count,
        totalRevenue: Math.round(d.totalRevenue * 100) / 100,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue),
    byLeadOffice: Object.entries(byOffice)
      .map(([name, d]) => ({
        name,
        count: d.count,
        totalRevenue: Math.round(d.totalRevenue * 100) / 100,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue),
    byStatus: Object.entries(byStatus).map(([name, d]) => ({
      name,
      count: d.count,
      totalRevenue: Math.round(d.totalRevenue * 100) / 100,
    })),
  }
}

function generateSectionSummary(records: unknown[]): unknown {
  const data = records as Array<{
    sections: Array<{ section_name: string; bid_total: number; recap_total: number | null }>
  }>

  const sectionCounts: Record<string, number> = {}
  for (const r of data) {
    for (const s of r.sections) {
      sectionCounts[s.section_name] = (sectionCounts[s.section_name] || 0) + 1
    }
  }

  return {
    totalEventsAnalyzed: data.length,
    sections: Object.entries(sectionCounts)
      .map(([name, count]) => ({
        name,
        eventCount: count,
        percentOfEvents: Math.round((count / data.length) * 10000) / 100,
      }))
      .sort((a, b) => b.eventCount - a.eventCount),
  }
}

// Generate all data
console.log('Generating sample source data files...\n')

const masterIndex = generateMasterIndex()
const rateCard = generateRateCard()
const financialSummary = generateFinancialSummary(masterIndex)
const sectionSummary = generateSectionSummary(masterIndex)

const files = [
  { name: 'enriched_master_index.json', data: masterIndex },
  { name: 'rate_card_master.json', data: rateCard },
  { name: 'financial_summary.json', data: financialSummary },
  { name: 'section_summary.json', data: sectionSummary },
]

for (const file of files) {
  const filePath = path.join(ROOT, file.name)
  const content = JSON.stringify(file.data, null, 2)
  fs.writeFileSync(filePath, content, 'utf-8')
  const size = Buffer.byteLength(content)
  const sizeStr = size > 1024 * 1024
    ? `${(size / 1024 / 1024).toFixed(1)} MB`
    : `${(size / 1024).toFixed(1)} KB`
  console.log(`  ${file.name}: ${sizeStr}`)
}

console.log('\nSource data files generated successfully.')
