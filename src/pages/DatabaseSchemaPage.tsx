import { useState } from 'react'
import { Database, Users, GitPullRequest, Shield, FileText } from 'lucide-react'
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

interface Column {
  name: string
  type: string
  constraints: string[]
}

interface TableDef {
  name: string
  columns: Column[]
}

interface TableGroup {
  id: string
  icon: typeof Database
  iconColor: string
  title: string
  subtitle: string
  tables: TableDef[]
}

const tableGroups: TableGroup[] = [
  {
    id: 'event-core',
    icon: Database,
    iconColor: 'text-amber-500',
    title: 'Event Core',
    subtitle: 'events, estimates, versions, line items, sections',
    tables: [
      {
        name: 'events',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'name', type: 'text', constraints: ['NOT NULL'] },
          { name: 'client', type: 'text', constraints: ['NOT NULL'] },
          { name: 'event_date', type: 'date', constraints: [] },
          { name: 'venue', type: 'text', constraints: [] },
          { name: 'status', type: 'text', constraints: ['NOT NULL'] },
          { name: 'lead_office', type: 'text', constraints: [] },
          { name: 'created_at', type: 'timestamptz', constraints: ['NOT NULL'] },
        ],
      },
      {
        name: 'estimates',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'event_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'version', type: 'integer', constraints: ['NOT NULL'] },
          { name: 'status', type: 'text', constraints: ['NOT NULL'] },
          { name: 'total_bid', type: 'numeric(12,2)', constraints: [] },
          { name: 'total_cost', type: 'numeric(12,2)', constraints: [] },
          { name: 'margin_pct', type: 'numeric(5,2)', constraints: [] },
          { name: 'created_by', type: 'uuid', constraints: ['FK'] },
          { name: 'created_at', type: 'timestamptz', constraints: ['NOT NULL'] },
        ],
      },
      {
        name: 'estimate_versions',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'estimate_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'version_number', type: 'integer', constraints: ['NOT NULL'] },
          { name: 'snapshot_json', type: 'jsonb', constraints: ['NOT NULL'] },
          { name: 'change_summary', type: 'text', constraints: [] },
          { name: 'created_at', type: 'timestamptz', constraints: ['NOT NULL'] },
        ],
      },
      {
        name: 'line_items',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'estimate_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'section_id', type: 'uuid', constraints: ['FK'] },
          { name: 'description', type: 'text', constraints: ['NOT NULL'] },
          { name: 'quantity', type: 'numeric(10,2)', constraints: [] },
          { name: 'unit_rate', type: 'numeric(10,2)', constraints: [] },
          { name: 'total', type: 'numeric(12,2)', constraints: [] },
          { name: 'gl_code', type: 'text', constraints: [] },
        ],
      },
      {
        name: 'sections',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'estimate_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'name', type: 'text', constraints: ['NOT NULL'] },
          { name: 'subtotal', type: 'numeric(12,2)', constraints: [] },
          { name: 'margin_pct', type: 'numeric(5,2)', constraints: [] },
          { name: 'sort_order', type: 'integer', constraints: [] },
        ],
      },
    ],
  },
  {
    id: 'labor-rates',
    icon: Users,
    iconColor: 'text-blue-500',
    title: 'Labor & Rates',
    subtitle: 'labor roles, logs, entries, and rate cards',
    tables: [
      {
        name: 'labor_roles',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'name', type: 'text', constraints: ['NOT NULL'] },
          { name: 'normalized_name', type: 'text', constraints: ['UNIQUE'] },
          { name: 'default_rate', type: 'numeric(10,2)', constraints: [] },
          { name: 'category', type: 'text', constraints: [] },
        ],
      },
      {
        name: 'labor_logs',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'estimate_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'location_name', type: 'text', constraints: ['NOT NULL'] },
          { name: 'location_order', type: 'integer', constraints: [] },
          { name: 'start_date', type: 'date', constraints: [] },
          { name: 'end_date', type: 'date', constraints: [] },
        ],
      },
      {
        name: 'labor_entries',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'labor_log_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'role_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'quantity', type: 'integer', constraints: ['NOT NULL'] },
          { name: 'days', type: 'integer', constraints: ['NOT NULL'] },
          { name: 'unit_rate', type: 'numeric(10,2)', constraints: [] },
          { name: 'cost_rate_corporate', type: 'numeric(10,2)', constraints: [] },
          { name: 'cost_rate_office', type: 'numeric(10,2)', constraints: [] },
          { name: 'override_rate', type: 'numeric(10,2)', constraints: [] },
          { name: 'override_reason', type: 'text', constraints: [] },
          { name: 'total_revenue', type: 'numeric(12,2)', constraints: [] },
          { name: 'total_cost', type: 'numeric(12,2)', constraints: [] },
          { name: 'per_diem', type: 'numeric(10,2)', constraints: [] },
        ],
      },
      {
        name: 'rate_cards',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'role_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'percentile_25', type: 'numeric(10,2)', constraints: [] },
          { name: 'median', type: 'numeric(10,2)', constraints: [] },
          { name: 'percentile_75', type: 'numeric(10,2)', constraints: [] },
          { name: 'avg', type: 'numeric(10,2)', constraints: [] },
          { name: 'sample_size', type: 'integer', constraints: [] },
          { name: 'updated_at', type: 'timestamptz', constraints: [] },
        ],
      },
    ],
  },
  {
    id: 'workflow',
    icon: GitPullRequest,
    iconColor: 'text-emerald-500',
    title: 'Workflow',
    subtitle: 'approvals, change orders, notifications',
    tables: [
      {
        name: 'approvals',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'estimate_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'approver_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'status', type: 'text', constraints: ['NOT NULL'] },
          { name: 'comments', type: 'text', constraints: [] },
          { name: 'decided_at', type: 'timestamptz', constraints: [] },
        ],
      },
      {
        name: 'change_orders',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'estimate_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'description', type: 'text', constraints: ['NOT NULL'] },
          { name: 'amount_delta', type: 'numeric(12,2)', constraints: [] },
          { name: 'approved_by', type: 'uuid', constraints: ['FK'] },
          { name: 'created_at', type: 'timestamptz', constraints: ['NOT NULL'] },
        ],
      },
      {
        name: 'notifications',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'user_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'type', type: 'text', constraints: ['NOT NULL'] },
          { name: 'message', type: 'text', constraints: ['NOT NULL'] },
          { name: 'read', type: 'boolean', constraints: ['NOT NULL'] },
          { name: 'created_at', type: 'timestamptz', constraints: ['NOT NULL'] },
        ],
      },
    ],
  },
  {
    id: 'users-auth',
    icon: Shield,
    iconColor: 'text-violet-500',
    title: 'Users & Auth',
    subtitle: 'users, roles, permissions',
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'email', type: 'text', constraints: ['UNIQUE', 'NOT NULL'] },
          { name: 'name', type: 'text', constraints: ['NOT NULL'] },
          { name: 'role_id', type: 'uuid', constraints: ['FK'] },
          { name: 'office', type: 'text', constraints: [] },
          { name: 'active', type: 'boolean', constraints: ['NOT NULL'] },
          { name: 'created_at', type: 'timestamptz', constraints: ['NOT NULL'] },
        ],
      },
      {
        name: 'roles',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'name', type: 'text', constraints: ['UNIQUE', 'NOT NULL'] },
          { name: 'description', type: 'text', constraints: [] },
          { name: 'permissions_json', type: 'jsonb', constraints: [] },
        ],
      },
      {
        name: 'permissions',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'role_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'resource', type: 'text', constraints: ['NOT NULL'] },
          { name: 'action', type: 'text', constraints: ['NOT NULL'] },
        ],
      },
    ],
  },
  {
    id: 'audit',
    icon: FileText,
    iconColor: 'text-slate-400',
    title: 'Audit',
    subtitle: 'audit log for all data changes',
    tables: [
      {
        name: 'audit_log',
        columns: [
          { name: 'id', type: 'uuid', constraints: ['PK'] },
          { name: 'user_id', type: 'uuid', constraints: ['FK', 'NOT NULL'] },
          { name: 'action', type: 'text', constraints: ['NOT NULL'] },
          { name: 'table_name', type: 'text', constraints: ['NOT NULL'] },
          { name: 'record_id', type: 'uuid', constraints: [] },
          { name: 'old_values', type: 'jsonb', constraints: [] },
          { name: 'new_values', type: 'jsonb', constraints: [] },
          { name: 'created_at', type: 'timestamptz', constraints: ['NOT NULL'] },
        ],
      },
    ],
  },
]

const rlsPolicies = [
  { table: 'events', policy: 'Users can only view events belonging to their lead_office' },
  { table: 'estimates', policy: 'Creators can edit their own drafts; approvers see estimates assigned to them' },
  { table: 'line_items', policy: 'Inherits access from parent estimate via estimate_id FK' },
  { table: 'approvals', policy: 'Approvers see only their assigned reviews; admins see all' },
  { table: 'users', policy: 'Users can read their own profile; admins can manage all users' },
  { table: 'audit_log', policy: 'Read-only access for admins; no direct writes (trigger-populated)' },
  { table: 'notifications', policy: 'Users can only read and update their own notifications' },
  { table: 'rate_cards', policy: 'Read access for all authenticated users; write access for admins only' },
]

const constraintColor: Record<string, string> = {
  PK: 'border-amber-500/50 text-amber-600 dark:text-amber-400',
  FK: 'border-blue-500/50 text-blue-600 dark:text-blue-400',
  UNIQUE: 'border-violet-500/50 text-violet-600 dark:text-violet-400',
  'NOT NULL': '',
}

function ConstraintBadge({ label }: { label: string }) {
  return (
    <Badge variant="outline" className={`text-[10px] ${constraintColor[label] ?? ''}`}>
      {label}
    </Badge>
  )
}

function SchemaTable({ table }: { table: TableDef }) {
  return (
    <div>
      <p className="text-sm font-medium mb-2 font-mono">{table.name}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Column</TableHead>
            <TableHead className="w-[140px]">Type</TableHead>
            <TableHead>Constraints</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.columns.map((col) => (
            <TableRow key={col.name}>
              <TableCell className="font-mono text-xs">{col.name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{col.type}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {col.constraints.map((c) => (
                    <ConstraintBadge key={c} label={c} />
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function DatabaseSchemaPage() {
  const [expanded, setExpanded] = useState<string | null>('event-core')

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">
          Database Schema
        </h1>
        <p className="text-muted-foreground">
          Planned PostgreSQL / Supabase schema — tables, relationships, and row-level security policies.
        </p>
      </div>

      {/* Section 1: ER Overview */}
      <Card>
        <div className="px-6 py-4">
          <p className="font-semibold">Entity Relationship Overview</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Table groups and their foreign-key relationships in the planned schema.
          </p>
        </div>
        <CardContent className="border-t pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tableGroups.map((group) => {
              const Icon = group.icon
              return (
                <div key={group.id} className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted ${group.iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold">{group.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {group.tables.map((t) => (
                      <Badge key={t.name} variant="outline" className="font-mono text-[10px]">
                        {t.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 rounded-lg border bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Key relationships:</span>{' '}
              estimates → events (event_id) · line_items → estimates (estimate_id) · line_items → sections (section_id) ·
              labor_logs → estimates (estimate_id) · labor_entries → labor_logs (labor_log_id) · labor_entries → labor_roles (role_id) ·
              rate_cards → labor_roles (role_id) · approvals → estimates (estimate_id) ·
              approvals → users (approver_id) · change_orders → estimates (estimate_id) ·
              users → roles (role_id) · permissions → roles (role_id) · audit_log → users (user_id)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Expandable table-group cards */}
      <div className="space-y-3">
        {tableGroups.map((group) => (
          <ExpandableCard
            key={group.id}
            icon={group.icon}
            iconColor={group.iconColor}
            title={group.title}
            subtitle={group.subtitle}
            isExpanded={expanded === group.id}
            onToggle={() => toggle(group.id)}
          >
            <div className="space-y-6">
              {group.tables.map((table) => (
                <SchemaTable key={table.name} table={table} />
              ))}
            </div>
          </ExpandableCard>
        ))}
      </div>

      {/* Section 3: Row-Level Security */}
      <Card>
        <div className="px-6 py-4">
          <p className="font-semibold">Row-Level Security &amp; Policies</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Supabase RLS policies ensuring data access is scoped to each user's role and office.
          </p>
        </div>
        <CardContent className="border-t pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Table</TableHead>
                <TableHead>Policy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rlsPolicies.map((row) => (
                <TableRow key={row.table}>
                  <TableCell className="font-mono text-xs">{row.table}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.policy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 rounded-lg border bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Realtime scoping:</span>{' '}
              Supabase Realtime subscriptions are filtered through the same RLS policies — users only receive
              live updates for records they are authorized to view (e.g., approval status changes for their assigned estimates).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
