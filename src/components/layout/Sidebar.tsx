import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart3, ClipboardList, Bot, Layers, Database, GitBranch, Map, FileSpreadsheet, DollarSign, MessageSquare, Briefcase, Users, ChevronsLeft, ChevronsRight, LayoutDashboard, Settings, Landmark, BookOpen } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

const discoveryItems = [
  { to: '/dashboard', label: 'Historical Dashboard', icon: BarChart3 },
  { to: '/rate-card', label: 'Historical Rate Analysis', icon: ClipboardList },
]

const deliverableItems = [
  { to: '/system-architecture', label: 'System Architecture', icon: Layers },
  { to: '/database-schema', label: 'Database Schema', icon: Database },
  { to: '/estimate-lifecycle', label: 'Estimate Lifecycle', icon: GitBranch },
  { to: '/phase2-roadmap', label: 'Phase 2 Roadmap', icon: Map },
]

const productionItems = [
  { to: '/pipeline-dashboard', label: 'Pipeline Dashboard', icon: LayoutDashboard },
  { to: '/estimates', label: 'Estimates', icon: Briefcase },
  { to: '/rate-card-management', label: 'Rate Cards', icon: DollarSign },
  { to: '/ai-assistant', label: 'AI Scoping', icon: Bot },
]

const uiConceptItems = [
  { to: '/estimate-builder', label: 'Estimate Builder', icon: FileSpreadsheet },
]

const adminItems = [
  { to: '/admin/accounting-setup', label: 'Accounting Setup', icon: Landmark },
  { to: '/admin/feedback', label: 'Feedback Management', icon: MessageSquare },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/settings', label: 'System Settings', icon: Settings },
]

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed'
const SHOW_DEMO_NAV_ONLY = true

type NavItemData = { to: string; label: string; icon: React.ComponentType<{ className?: string }> }

function NavSection({ title, items, collapsed }: { title: string; items: NavItemData[]; collapsed: boolean }) {
  return (
    <>
      {!collapsed && (
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavItem key={item.to} {...item} collapsed={collapsed} />
      ))}
      <div className="my-3" />
    </>
  )
}

function ExternalNavItem({ href, label, icon: Icon, collapsed }: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; collapsed?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      title={collapsed ? label : undefined}
      className={[
        'flex items-center rounded-md text-sm font-medium transition-colors',
        collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2',
        collapsed
          ? 'text-zinc-400 hover:bg-sidebar-accent/50 hover:text-zinc-300'
          : 'border-l-[3px] border-transparent text-zinc-400 hover:bg-sidebar-accent/50 hover:text-zinc-300',
      ].join(' ')}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && label}
    </a>
  )
}

function NavItem({ to, label, icon: Icon, collapsed }: NavItemData & { collapsed?: boolean }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          'flex items-center rounded-md text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2',
          isActive
            ? collapsed
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'border-l-[3px] border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground'
            : collapsed
              ? 'text-zinc-400 hover:bg-sidebar-accent/50 hover:text-zinc-300'
              : 'border-l-[3px] border-transparent text-zinc-400 hover:bg-sidebar-accent/50 hover:text-zinc-300',
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && label}
    </NavLink>
  )
}

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const canEditAccountingSetup = !!profile && hasPermission(profile.role, 'edit_accounting_mappings')
  const visibleAdminItems = isAdmin ? adminItems : adminItems.filter((item) => item.to === '/admin/accounting-setup')

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  })

  function toggleCollapse() {
    setCollapsed(prev => {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!prev))
      return !prev
    })
  }

  return (
    <aside className={`flex h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className={`flex items-center ${collapsed ? 'justify-center px-2 py-4' : 'px-6 py-5'}`}>
        <img src={collapsed ? '/Favicon2.webp' : '/DriveShop_WebLogo.png'} alt="DriveShop" className={collapsed ? 'h-8 w-8' : 'h-8 w-auto'} />
      </div>
      {!collapsed && (
        <p className="-mt-3 px-6 pb-2 text-xs font-medium text-zinc-400">Event Estimate Engine</p>
      )}
      <Separator className="bg-sidebar-border" />
      <nav className={`flex-1 space-y-1 overflow-y-auto py-4 ${collapsed ? 'px-1' : 'px-3'}`}>
        {!SHOW_DEMO_NAV_ONLY && (
          <>
            <NavSection title="Discovery Intelligence" items={discoveryItems} collapsed={collapsed} />
            <NavSection title="Phase 1 Deliverables" items={deliverableItems} collapsed={collapsed} />
          </>
        )}
        <NavSection title="Production" items={productionItems} collapsed={collapsed} />
        <ExternalNavItem href="/guide.html" label="User Guide" icon={BookOpen} collapsed={collapsed} />
        <div className="my-3" />
        {!SHOW_DEMO_NAV_ONLY && <NavSection title="UI Concepts" items={uiConceptItems} collapsed={collapsed} />}
        {canEditAccountingSetup && <NavSection title="Admin" items={visibleAdminItems} collapsed={collapsed} />}
      </nav>
      <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} px-3 py-1`}>
        <button
          onClick={toggleCollapse}
          className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
      <div className="border-t border-sidebar-border px-4 py-3">
        {profile ? (
          collapsed ? (
            <div className="flex justify-center" title={profile.full_name}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-300">
                {profile.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-zinc-300">{profile.full_name}</p>
                <p className="truncate text-[10px] text-zinc-500">{profile.role.replace('_', ' ')}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="shrink-0 rounded px-2 py-1 text-[10px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              >
                Sign out
              </button>
            </div>
          )
        ) : (
          <p className="text-xs text-zinc-500">Not signed in</p>
        )}
      </div>
    </aside>
  )
}
