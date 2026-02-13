import { NavLink } from 'react-router-dom'
import { GitBranch, Map, FileSpreadsheet, DollarSign, MessageSquare } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const reviewItems = [
  { to: '/stakeholder/estimate-lifecycle', label: 'Estimate Lifecycle', icon: GitBranch },
  { to: '/stakeholder/phase2-roadmap', label: 'Phase 2 Roadmap', icon: Map },
  { to: '/stakeholder/estimate-builder', label: 'Estimate Builder', icon: FileSpreadsheet },
  { to: '/stakeholder/rate-card-management', label: 'Rate Card Management', icon: DollarSign },
]

const feedbackItems = [
  { to: '/stakeholder/feedback', label: 'Submit Feedback', icon: MessageSquare },
]

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'border-l-[3px] border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground'
            : 'border-l-[3px] border-transparent text-zinc-400 hover:bg-sidebar-accent/50 hover:text-zinc-300',
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  )
}

export function StakeholderSidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-5">
        <span className="text-xl font-extrabold tracking-tight">DriveShop</span>
        <p className="mt-0.5 text-xs font-medium text-zinc-400">Stakeholder Review Portal</p>
      </div>
      <Separator className="bg-sidebar-border" />
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Review Pages
        </p>
        {reviewItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="my-3" />

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Feedback
        </p>
        {feedbackItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
      <div className="px-6 py-4">
        <p className="text-xs text-zinc-400">Stakeholder Review</p>
        <p className="mt-1 text-xs text-zinc-500">February 2026</p>
      </div>
    </aside>
  )
}
