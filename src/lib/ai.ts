import Anthropic from '@anthropic-ai/sdk'
import type { AIContext } from '@/types/ai-context'

export interface EventParams {
  eventName: string
  eventType: string
  duration: number
  attendance: number
  location: string
  budgetRange: string
  sections: string[]
  specialRequirements: string
}

function getClient(): Anthropic {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error(
      'Missing API key. Set VITE_ANTHROPIC_API_KEY in your .env file.',
    )
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

export function buildSystemPrompt(context: AIContext): string {
  const sectionLines = context.sections
    .map(
      (s) =>
        `- ${s.name}: avg bid $${s.avgBid.toLocaleString(undefined, { maximumFractionDigits: 0 })}, avg actual $${(s.avgActual ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    )
    .join('\n')

  const roleLines = context.commonRoles
    .slice(0, 20)
    .map(
      (r) =>
        `- ${r.role}: $${r.rateMin.toFixed(0)}-$${r.rateMax.toFixed(0)} (avg $${r.rateAvg.toFixed(0)}), ${r.occurrences} occurrences`,
    )
    .join('\n')

  const segmentLines = context.revenueSegments
    .map((s) => `- ${s.name}: ${s.count} events, avg size $${s.avgSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}`)
    .join('\n')

  return `You are an expert DriveShop event scoping specialist. You have deep knowledge of experiential marketing, auto shows, ride & drive events, brand activations, and corporate events.

You have access to historical data from ${context.totalEvents.toLocaleString()} events (${context.eventsWithRecap.toLocaleString()} with recap/actuals) spanning ${context.dateRange.earliest ?? 'N/A'} to ${context.dateRange.latest ?? 'N/A'}.

HISTORICAL SECTION COST AVERAGES:
${sectionLines}

TOP 20 LABOR ROLES AND RATE RANGES (daily):
${roleLines}

REVENUE SEGMENTS:
${segmentLines}

INSTRUCTIONS:
- Base all recommendations on the historical data patterns above.
- Frame output as "data-backed recommendations" not guarantees.
- Consider the event type, duration, attendance, and budget when making recommendations.
- Scale staffing and costs proportionally to event size.
- Respond with ONLY valid JSON wrapped in \`\`\`json fences.

REQUIRED JSON RESPONSE STRUCTURE:
\`\`\`json
{
  "summary": "Brief 2-3 sentence scope overview",
  "staffing": [
    { "role": "Role Name", "quantity": 2, "days": 3, "dailyRate": 850, "totalCost": 5100, "rationale": "Why this role/count" }
  ],
  "costBreakdown": [
    { "section": "SECTION NAME", "estimatedCost": 45000, "percentOfTotal": 35, "notes": "Based on..." }
  ],
  "totalEstimate": { "low": 80000, "mid": 95000, "high": 115000 },
  "confidenceNotes": ["Note about data backing", "Note about assumptions"],
  "marginRecommendation": { "suggestedMarginPct": 15, "rationale": "Based on historical..." }
}
\`\`\``
}

function buildUserMessage(params: EventParams): string {
  const lines = [
    `Please generate a scope estimate for the following event:`,
    ``,
    `Event Type: ${params.eventType}`,
    `Duration: ${params.duration} day${params.duration > 1 ? 's' : ''}`,
    `Estimated Attendance: ${params.attendance.toLocaleString()}`,
  ]

  if (params.eventName) {
    lines.push(`Event Name: ${params.eventName}`)
  }
  if (params.location) {
    lines.push(`Location/Market: ${params.location}`)
  }
  if (params.budgetRange) {
    lines.push(`Budget Range: ${params.budgetRange}`)
  }

  lines.push(``, `Sections to include: ${params.sections.join(', ')}`)

  if (params.specialRequirements) {
    lines.push(``, `Special Requirements: ${params.specialRequirements}`)
  }

  return lines.join('\n')
}

export async function streamScopeEstimate(
  params: EventParams,
  context: AIContext,
  onChunk: (text: string) => void,
): Promise<string> {
  const client = getClient()
  const systemPrompt = buildSystemPrompt(context)
  const userMessage = buildUserMessage(params)

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  let accumulated = ''

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      accumulated += event.delta.text
      onChunk(accumulated)
    }
  }

  return accumulated
}
