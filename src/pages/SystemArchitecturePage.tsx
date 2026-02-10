import { useState } from 'react'
import { Monitor, Server, Database, Brain, Link } from 'lucide-react'
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

const layers = [
  {
    id: 'frontend',
    icon: Monitor,
    iconColor: 'text-blue-500',
    title: 'Frontend Application',
    subtitle: 'React + TailwindCSS + shadcn/ui',
    content: {
      description:
        'A single-page application providing the primary interface for event estimating, labor management, and operational oversight.',
      modules: [
        { name: 'Estimate Builder', detail: 'Multi-section cost estimator with line-item editing, section totals, and margin calculations' },
        { name: 'Labor Log', detail: 'Role-based labor scheduling with hours, rates, and per-diem tracking' },
        { name: 'Rate Cards', detail: 'Historical rate analysis with percentile ranges, outlier detection, and role normalization' },
        { name: 'Approvals Dashboard', detail: 'Pending/approved/rejected estimates with audit trail and status tracking' },
        { name: 'Pipeline Dashboard', detail: 'Event pipeline visualization with stage progression and revenue forecasting' },
        { name: 'PDF Preview', detail: 'Client-ready estimate preview with branded templates and export to PDF' },
      ],
    },
  },
  {
    id: 'backend',
    icon: Server,
    iconColor: 'text-emerald-500',
    title: 'Backend / API Layer',
    subtitle: 'Python + FastAPI',
    content: {
      description:
        'RESTful API handling all business logic, data validation, and third-party integrations.',
      modules: [
        { name: 'Margin Calculations', detail: 'Automatic margin computation with configurable targets per section and role' },
        { name: 'Version Control Engine', detail: 'Full estimate versioning with diff tracking, rollback, and change order management' },
        { name: 'Approval Routing', detail: 'Configurable approval workflows based on estimate value, event type, and organizational hierarchy' },
        { name: 'Auth + RBAC', detail: 'Role-based access control with JWT authentication, session management, and permission scoping' },
      ],
    },
  },
  {
    id: 'database',
    icon: Database,
    iconColor: 'text-amber-500',
    title: 'Database Layer',
    subtitle: 'PostgreSQL / Supabase',
    content: {
      description:
        'Relational database with real-time capabilities, row-level security, and managed hosting.',
      modules: [
        { name: 'Core Tables', detail: 'events, estimates, estimate_versions, line_items, sections, labor_roles, rate_cards' },
        { name: 'Operational Tables', detail: 'approvals, change_orders, users, roles, permissions, audit_log' },
        { name: 'Row-Level Security', detail: 'Postgres RLS policies ensuring users can only access data within their permission scope' },
        { name: 'Real-Time Subscriptions', detail: 'Supabase Realtime for live updates to approvals, status changes, and collaborative editing' },
      ],
    },
  },
  {
    id: 'ai',
    icon: Brain,
    iconColor: 'text-violet-500',
    title: 'AI Engine',
    subtitle: 'Claude API + Historical Intelligence',
    content: {
      description:
        'AI-powered scoping and estimation assistance trained on 988 historical DriveShop events.',
      modules: [
        { name: 'Scoping Recommendations', detail: 'Suggests staffing, equipment, and cost estimates based on similar past events' },
        { name: 'Inline Nudges', detail: 'Real-time suggestions during estimate creation (e.g., "Similar events typically include X")' },
        { name: 'Confidence Scoring', detail: 'Each recommendation includes a confidence score based on data density and event similarity' },
        { name: 'Historical Pattern Analysis', detail: 'Identifies cost patterns, seasonal trends, and bid-vs-actual variance across the portfolio' },
      ],
    },
  },
  {
    id: 'integrations',
    icon: Link,
    iconColor: 'text-slate-400',
    title: 'External Integrations',
    subtitle: 'Intacct + PDF + PowerBI',
    content: {
      description:
        'Connections to existing DriveShop systems for accounting, reporting, and document generation.',
      modules: [
        { name: 'Sage Intacct API', detail: 'Two-way sync for invoice generation, GL coding, and financial reconciliation' },
        { name: 'WeasyPrint PDF', detail: 'Server-side PDF generation with branded templates for client-facing estimates and invoices' },
        { name: 'PowerBI Feed', detail: 'Automated data feed for executive dashboards, pipeline reporting, and financial analytics' },
      ],
    },
  },
]

const techStack = [
  { layer: 'Frontend', technology: 'React 18 + TypeScript', notes: 'SPA with TailwindCSS, shadcn/ui, Recharts' },
  { layer: 'Backend', technology: 'Python + FastAPI', notes: 'Async REST API with Pydantic validation' },
  { layer: 'Database', technology: 'PostgreSQL (Supabase)', notes: 'Managed Postgres with RLS and Realtime' },
  { layer: 'AI', technology: 'Claude API (Anthropic)', notes: 'LLM for scoping, nudges, and pattern analysis' },
  { layer: 'PDF', technology: 'WeasyPrint', notes: 'HTML/CSS to PDF for branded estimate documents' },
  { layer: 'Accounting', technology: 'Sage Intacct API', notes: 'Invoice sync and GL coding' },
  { layer: 'Reporting', technology: 'PowerBI', notes: 'Executive dashboards and pipeline analytics' },
]

export function SystemArchitecturePage() {
  const [expanded, setExpanded] = useState<string | null>('frontend')

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">
          System Architecture
        </h1>
        <p className="text-muted-foreground">
          Event Estimate Engine — planned production system architecture and technology stack.
        </p>
      </div>

      <div className="space-y-3">
        {layers.map((layer) => (
          <ExpandableCard
            key={layer.id}
            icon={layer.icon}
            iconColor={layer.iconColor}
            title={layer.title}
            subtitle={layer.subtitle}
            isExpanded={expanded === layer.id}
            onToggle={() => toggle(layer.id)}
          >
            <p className="text-sm text-muted-foreground mb-4">
              {layer.content.description}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {layer.content.modules.map((mod) => (
                <div key={mod.name} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{mod.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {mod.detail}
                  </p>
                </div>
              ))}
            </div>
          </ExpandableCard>
        ))}
      </div>

      <Card>
        <div className="px-6 py-4">
          <p className="font-semibold">Tech Stack Summary</p>
        </div>
        <CardContent className="border-t pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Layer</TableHead>
                <TableHead>Technology</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {techStack.map((row) => (
                <TableRow key={row.layer}>
                  <TableCell>
                    <Badge variant="outline">{row.layer}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{row.technology}</TableCell>
                  <TableCell className="text-muted-foreground">{row.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
