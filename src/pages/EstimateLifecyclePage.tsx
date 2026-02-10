import { useState } from 'react'
import { ArrowRight, FileInput, FileOutput, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ExpandableCard } from '@/components/ExpandableCard'

interface StateDetail {
  whatHappens: string[]
  whoActs: string[]
  triggers: string[]
  dataCaptured: string[]
}

const lifecycleStates: { id: string; label: string; detail: StateDetail }[] = [
  {
    id: 'new',
    label: 'New Event',
    detail: {
      whatHappens: [
        'JotForm submission creates event record',
        'AI scoping engine analyzes event details',
        'Similar historical events identified and surfaced',
      ],
      whoActs: ['Client (via JotForm)', 'AI Engine (automatic)'],
      triggers: ['JotForm submission received'],
      dataCaptured: [
        'Event name, date, location',
        'Client contact info',
        'Venue details and requirements',
        'Initial scope description',
      ],
    },
  },
  {
    id: 'draft',
    label: 'Draft',
    detail: {
      whatHappens: [
        'Estimator builds line-item estimate',
        'Rate card defaults applied to labor roles',
        'AI nudges suggest items from similar events',
        'Sections created: labor, travel, equipment, materials',
      ],
      whoActs: ['Estimator', 'AI Engine (nudges)'],
      triggers: ['Estimator opens event and begins estimating'],
      dataCaptured: [
        'Line items with quantities and rates',
        'Section subtotals and margins',
        'Labor schedule with roles and hours',
        'Notes and assumptions',
      ],
    },
  },
  {
    id: 'pending',
    label: 'Pending Review',
    detail: {
      whatHappens: [
        'Estimate submitted for approval',
        'Approval routing based on value and event type',
        'Reviewer can approve, reject, or request changes',
        'Comments and revision history tracked',
      ],
      whoActs: ['Approver / Manager'],
      triggers: ['Estimator submits for review'],
      dataCaptured: [
        'Submission timestamp',
        'Assigned approver',
        'Review comments',
        'Approval/rejection decision',
      ],
    },
  },
  {
    id: 'approved',
    label: 'Approved',
    detail: {
      whatHappens: [
        'Estimate locked as approved version',
        'Client-facing PDF generated',
        'Estimate sent to client for signature',
        'Version snapshot stored for audit trail',
      ],
      whoActs: ['System (automatic)', 'Account Manager'],
      triggers: ['Approver marks estimate as approved'],
      dataCaptured: [
        'Approved version snapshot',
        'Approver name and timestamp',
        'Generated PDF reference',
        'Client delivery timestamp',
      ],
    },
  },
  {
    id: 'active',
    label: 'Active',
    detail: {
      whatHappens: [
        'Event in execution phase',
        'Change orders processed as needed',
        'Actuals tracked against estimate',
        'Labor hours logged in real time',
      ],
      whoActs: ['Event Manager', 'Field Staff'],
      triggers: ['Client signs approved estimate'],
      dataCaptured: [
        'Change order details and approvals',
        'Actual labor hours per role',
        'Actual expenses and receipts',
        'On-site notes and updates',
      ],
    },
  },
  {
    id: 'recap',
    label: 'Recap',
    detail: {
      whatHappens: [
        'Post-event reconciliation',
        'Actual costs compared to estimates',
        'Variance analysis generated',
        'Lessons learned captured for AI training',
      ],
      whoActs: ['Event Manager', 'Finance Team'],
      triggers: ['Event concludes, all actuals submitted'],
      dataCaptured: [
        'Final actual costs per section',
        'Bid-vs-actual variance percentages',
        'Margin realization metrics',
        'Event outcome notes',
      ],
    },
  },
  {
    id: 'complete',
    label: 'Complete',
    detail: {
      whatHappens: [
        'Event record finalized and archived',
        'Historical data feeds AI learning model',
        'Rate card statistics updated',
        'Event available for future similarity matching',
      ],
      whoActs: ['System (automatic)'],
      triggers: ['Finance team marks reconciliation complete'],
      dataCaptured: [
        'Final P&L summary',
        'Normalized role rates for rate card',
        'Event categorization tags',
        'Searchable archive record',
      ],
    },
  },
  {
    id: 'intacct',
    label: 'Intacct',
    detail: {
      whatHappens: [
        'Invoice generated in Sage Intacct',
        'GL codes applied per section',
        'Revenue recognition triggered',
        'Financial reporting updated',
      ],
      whoActs: ['System (automatic)', 'Finance Team'],
      triggers: ['Event marked complete with approved actuals'],
      dataCaptured: [
        'Intacct invoice ID',
        'GL code mappings',
        'Payment status',
        'Sync confirmation timestamp',
      ],
    },
  },
]

const dataFlows = [
  {
    id: 'intake',
    icon: FileInput,
    iconColor: 'text-blue-500',
    title: 'JotForm → Estimate Engine',
    subtitle: 'Event intake and initial scoping',
    items: [
      'Client submits event request via JotForm',
      'Webhook triggers event creation in the Estimate Engine',
      'AI engine analyzes event details and finds similar historical events',
      'Estimator notified of new event with AI-generated scope suggestions',
    ],
  },
  {
    id: 'invoicing',
    icon: FileOutput,
    iconColor: 'text-emerald-500',
    title: 'Estimate Engine → Intacct',
    subtitle: 'Invoicing and financial sync',
    items: [
      'Approved estimate data mapped to Intacct invoice format',
      'GL codes assigned per section (labor, travel, equipment, etc.)',
      'Invoice created in Intacct via API',
      'Payment status synced back to Estimate Engine for tracking',
    ],
  },
  {
    id: 'reporting',
    icon: BarChart3,
    iconColor: 'text-violet-500',
    title: 'Estimate Engine → PowerBI + Claude AI',
    subtitle: 'Reporting and continuous learning',
    items: [
      'Completed event data feeds PowerBI executive dashboards',
      'Pipeline metrics update in real time for revenue forecasting',
      'Recap data trains Claude AI for improved scoping accuracy',
      'Rate card statistics refresh with latest bid and actual rates',
    ],
  },
]

export function EstimateLifecyclePage() {
  const [selectedState, setSelectedState] = useState<string>('new')
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null)

  const currentState = lifecycleStates.find((s) => s.id === selectedState)

  function toggleFlow(id: string) {
    setExpandedFlow((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">
          Estimate Lifecycle & Data Flow
        </h1>
        <p className="text-muted-foreground">
          How an event estimate moves from intake to invoicing — states, transitions, and data captured at each stage.
        </p>
      </div>

      {/* Horizontal flow */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {lifecycleStates.map((state, i) => (
              <div key={state.id} className="flex shrink-0 items-center">
                <button
                  onClick={() => setSelectedState(state.id)}
                  className={[
                    'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                    selectedState === state.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                  ].join(' ')}
                >
                  {state.label}
                </button>
                {i < lifecycleStates.length - 1 && (
                  <ArrowRight className="mx-1 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected state detail */}
      {currentState && (
        <Card>
          <div className="px-6 py-4 border-b">
            <p className="font-semibold text-lg">{currentState.label}</p>
          </div>
          <CardContent className="pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailQuadrant title="What Happens" items={currentState.detail.whatHappens} />
              <DetailQuadrant title="Who Acts" items={currentState.detail.whoActs} />
              <DetailQuadrant title="Transition Triggers" items={currentState.detail.triggers} />
              <DetailQuadrant title="Data Captured" items={currentState.detail.dataCaptured} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Flow section */}
      <div className="pt-2">
        <h2 className="text-lg font-semibold mb-3">Data Flow</h2>
        <div className="space-y-3">
          {dataFlows.map((flow) => (
            <ExpandableCard
              key={flow.id}
              icon={flow.icon}
              iconColor={flow.iconColor}
              title={flow.title}
              subtitle={flow.subtitle}
              isExpanded={expandedFlow === flow.id}
              onToggle={() => toggleFlow(flow.id)}
            >
              <ul className="space-y-2">
                {flow.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </ExpandableCard>
          ))}
        </div>
      </div>
    </div>
  )
}

function DetailQuadrant({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-semibold mb-2">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
