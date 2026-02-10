import { useState } from 'react'
import { Database, FileText, GitPullRequest, Brain, FileOutput, Rocket } from 'lucide-react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ExpandableCard } from '@/components/ExpandableCard'

interface Phase {
  id: string
  icon: typeof Database
  iconColor: string
  barColor: string
  title: string
  subtitle: string
  weeks: string
  weekStart: number
  weekEnd: number
  description: string
  deliverables: string[]
  milestone: string
  note?: string
}

const phases: Phase[] = [
  {
    id: 'weeks-1-2',
    icon: Database,
    iconColor: 'text-amber-500',
    barColor: 'bg-amber-500',
    title: 'Rate Card Engine + Database Setup',
    subtitle: 'Weeks 1–2',
    weeks: 'Wk 1–2',
    weekStart: 1,
    weekEnd: 2,
    description:
      'Stand up the PostgreSQL/Supabase database and build the rate card management system. Load the DriveShop standard rate card (55 roles from Phase 1) and create client MSA rate cards.',
    deliverables: [
      'PostgreSQL/Supabase schema deployment',
      'Rate card management CRUD',
      'DriveShop standard rate card loaded (55 roles from Phase 1)',
      'Client MSA rate card creation (Genesis, Volvo, Audi, Mazda)',
      'User validates rate cards against actual MSA documents',
    ],
    milestone: 'Rate cards operational, User can manage rates',
    note: 'User requested new proposed rates persist to master rate table',
  },
  {
    id: 'weeks-3-5',
    icon: FileText,
    iconColor: 'text-blue-500',
    barColor: 'bg-blue-500',
    title: 'Labor Log + Estimate Builder',
    subtitle: 'Weeks 3–5',
    weeks: 'Wk 3–5',
    weekStart: 3,
    weekEnd: 5,
    description:
      'Build the two core modules: the Labor Log (elevated priority per kickoff) and the Estimate Builder with section-based line items and auto-calculations.',
    deliverables: [
      'Labor Log — role selection from rate card with search',
      'Labor Log — Qty × Days × Rate auto-calculation',
      'Labor Log — multi-location support (1 estimate → N labor logs)',
      'Labor Log — schedule/calendar view, per diem auto-calc',
      'Estimate Builder — event overview, office vs corporate toggle',
      'Estimate Builder — section-based line items (7 cost sections)',
      'Estimate Builder — auto-calculations: revenue, net revenue, GP per line item',
      'Estimate Builder — pass-through cost tracking, rate card overrides with reason logging',
    ],
    milestone: 'User can build a complete estimate',
  },
  {
    id: 'weeks-6-7',
    icon: GitPullRequest,
    iconColor: 'text-emerald-500',
    barColor: 'bg-emerald-500',
    title: 'Workflow Engine + Approvals',
    subtitle: 'Weeks 6–7',
    weeks: 'Wk 6–7',
    weekStart: 6,
    weekEnd: 7,
    description:
      'Implement the full status state machine and approval routing with version history and notifications.',
    deliverables: [
      'Status state machine: Draft → Pending Review → Approved → Active → Recap → Complete',
      'Approval routing (AM review for all, $50K+ executive review)',
      'Version history with full snapshots, rollback capability',
      'Email notifications for approval requests and status changes',
    ],
    milestone: 'Complete approval workflow operational',
  },
  {
    id: 'weeks-8-10',
    icon: Brain,
    iconColor: 'text-violet-500',
    barColor: 'bg-violet-500',
    title: 'AI Scoping Assistant (Full)',
    subtitle: 'Weeks 8–10',
    weeks: 'Wk 8–10',
    weekStart: 8,
    weekEnd: 10,
    description:
      'Retrain the AI assistant on 988 bid-vs-actual events and integrate inline validation nudges into the Estimate Builder UI.',
    deliverables: [
      'Retrain on 988 bid-vs-actual events',
      'Event type classification, client/market-specific recommendations',
      'Inline validation nudges in Estimate Builder UI',
      'Confidence scoring based on comparable event matches',
    ],
    milestone: 'AI assistant integrated into estimate creation flow',
  },
  {
    id: 'weeks-11-12',
    icon: FileOutput,
    iconColor: 'text-orange-500',
    barColor: 'bg-orange-500',
    title: 'Change Orders, Recaps, PDF Outputs',
    subtitle: 'Weeks 11–12',
    weeks: 'Wk 11–12',
    weekStart: 11,
    weekEnd: 12,
    description:
      'Close the estimate lifecycle loop with change orders, recap entry, variance analysis, and PDF generation.',
    deliverables: [
      'Change order generation with auto-delta from approved version',
      'Recap entry: actual costs, hours, quantities per section',
      'Document upload for receipts/backup',
      'Variance analysis: estimated vs actual with drill-down',
      'PDF generation: client-facing (sanitized) + internal (full P&L)',
    ],
    milestone: 'Full estimate lifecycle from creation through recap',
  },
  {
    id: 'weeks-13-14',
    icon: Rocket,
    iconColor: 'text-rose-500',
    barColor: 'bg-rose-500',
    title: 'Integrations + QA + Go-Live',
    subtitle: 'Weeks 13–14',
    weeks: 'Wk 13–14',
    weekStart: 13,
    weekEnd: 14,
    description:
      'Connect to external systems, finalize the pipeline dashboard, run QA/UAT, and go live.',
    deliverables: [
      'Intacct API integration (invoice data push, field mapping)',
      'Pipeline dashboard (real-time forecast from approved estimates)',
      'PowerBI data feed',
      'QA and user acceptance testing',
      'Documentation and training',
    ],
    milestone: 'System go-live',
  },
]

const milestones = [
  { week: 2, milestone: 'Rate cards operational, User can manage rates' },
  { week: 5, milestone: 'User can build a complete estimate' },
  { week: 7, milestone: 'Complete approval workflow operational' },
  { week: 10, milestone: 'AI assistant integrated into estimate creation flow' },
  { week: 12, milestone: 'Full estimate lifecycle from creation through recap' },
  { week: 14, milestone: 'System go-live' },
]

const TOTAL_WEEKS = 14

export function Phase2RoadmapPage() {
  const [expanded, setExpanded] = useState<string | null>('weeks-1-2')

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">
          Phase 2 Build Plan — 14 Weeks
        </h1>
        <p className="text-muted-foreground">
          Development timeline, milestones, and deliverables for the Event Estimate Engine production build.
        </p>
      </div>

      {/* Section 1: Timeline Overview */}
      <Card>
        <div className="px-6 py-4">
          <p className="font-semibold">Timeline Overview</p>
          <p className="mt-1 text-sm text-muted-foreground">
            6 phases spanning 14 weeks — click a phase below for details.
          </p>
        </div>
        <CardContent className="border-t pt-4">
          {/* Week labels */}
          <div className="flex mb-2">
            {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
              <div
                key={i}
                className="text-[10px] text-muted-foreground text-center"
                style={{ width: `${100 / TOTAL_WEEKS}%` }}
              >
                {i + 1}
              </div>
            ))}
          </div>
          {/* Gantt bars */}
          <div className="flex h-10 rounded-lg overflow-hidden border">
            {phases.map((phase) => {
              const span = phase.weekEnd - phase.weekStart + 1
              return (
                <button
                  key={phase.id}
                  className={`${phase.barColor} flex items-center justify-center text-white text-[10px] font-medium leading-tight hover:brightness-110 transition-all`}
                  style={{ width: `${(span / TOTAL_WEEKS) * 100}%` }}
                  onClick={() => {
                    setExpanded(phase.id)
                  }}
                  title={`${phase.title} (${phase.subtitle})`}
                >
                  <span className="truncate px-1">{phase.weeks}</span>
                </button>
              )
            })}
          </div>
          {/* Phase name labels */}
          <div className="flex mt-1">
            {phases.map((phase) => {
              const span = phase.weekEnd - phase.weekStart + 1
              return (
                <div
                  key={phase.id}
                  className="text-[9px] text-muted-foreground text-center truncate px-0.5"
                  style={{ width: `${(span / TOTAL_WEEKS) * 100}%` }}
                >
                  {phase.title}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Phase detail cards */}
      <div className="space-y-3">
        {phases.map((phase) => (
          <ExpandableCard
            key={phase.id}
            icon={phase.icon}
            iconColor={phase.iconColor}
            title={phase.title}
            subtitle={phase.subtitle}
            isExpanded={expanded === phase.id}
            onToggle={() => toggle(phase.id)}
          >
            <p className="text-sm text-muted-foreground mb-4">
              {phase.description}
            </p>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Deliverables</p>
              <ul className="space-y-1.5">
                {phase.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
                  Milestone
                </Badge>
                <span className="text-sm">{phase.milestone}</span>
              </div>
              {phase.note && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                    Priority
                  </Badge>
                  <span className="text-sm text-muted-foreground">{phase.note}</span>
                </div>
              )}
            </div>
          </ExpandableCard>
        ))}
      </div>

      {/* Section 3: Milestones Summary */}
      <Card>
        <div className="px-6 py-4">
          <p className="font-semibold">Key Milestones</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Target delivery dates for each major milestone in the 14-week build.
          </p>
        </div>
        <CardContent className="border-t pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Week</TableHead>
                <TableHead>Milestone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map((row) => (
                <TableRow key={row.week}>
                  <TableCell>
                    <Badge variant="outline">{row.week}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{row.milestone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
