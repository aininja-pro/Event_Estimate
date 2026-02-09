import { NavLink } from 'react-router-dom'
import { BarChart3, ClipboardList, Bot } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/dashboard', label: 'Historical Dashboard', icon: BarChart3 },
  { to: '/rate-card', label: 'Historical Rate Analysis', icon: ClipboardList },
  { to: '/ai-assistant', label: 'AI Scoping Assistant', icon: Bot },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-5">
        <span className="text-xl font-extrabold tracking-tight">DriveShop</span>
        <p className="mt-0.5 text-xs font-medium text-zinc-400">Event Estimate Engine</p>
      </div>
      <Separator className="bg-sidebar-border" />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
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
        ))}
      </nav>
      <div className="px-6 py-4">
        <p className="text-xs text-zinc-400">Phase 1 Discovery</p>
        <p className="text-xs text-zinc-400">Intelligence Report</p>
        <p className="mt-1 text-xs text-zinc-500">February 2026</p>
      </div>
    </aside>
  )
}
