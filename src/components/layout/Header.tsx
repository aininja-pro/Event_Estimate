import { useLocation } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Historical Intelligence Dashboard',
  '/rate-card': 'Historical Rate Analysis',
  '/ai-assistant': 'AI Scoping Assistant',
  '/system-architecture': 'System Architecture',
  '/database-schema': 'Database Schema',
  '/estimate-lifecycle': 'Estimate Lifecycle',
  '/phase2-roadmap': 'Phase 2 Roadmap',
  '/estimates': 'Estimates',
  '/estimate-builder': 'Estimate Builder',
  '/rate-card-management': 'Rate Card Management',
  '/admin/feedback': 'Feedback Management',
}

export function Header() {
  const location = useLocation()
  const title = pageTitles[location.pathname]
    ?? (location.pathname.startsWith('/estimates/') ? 'Estimate Builder' : 'Event Estimate Engine')

  const productionPages = ['/rate-card-management', '/estimates']
  const isProduction = productionPages.includes(location.pathname) || location.pathname.startsWith('/estimates/')

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {!isProduction && (
          <p className="text-sm text-muted-foreground">
            Phase 1 Discovery Intelligence Report
            <span className="mx-2 text-border">|</span>
            <span className="text-muted-foreground/70">Prepared for DriveShop</span>
          </p>
        )}
      </div>
      <Badge variant="destructive" className="text-xs font-semibold tracking-wide">CONFIDENTIAL</Badge>
    </header>
  )
}
