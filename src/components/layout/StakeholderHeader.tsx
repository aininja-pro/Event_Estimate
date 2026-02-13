import { useLocation } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

const pageTitles: Record<string, string> = {
  '/stakeholder/estimate-lifecycle': 'Estimate Lifecycle',
  '/stakeholder/phase2-roadmap': 'Phase 2 Roadmap',
  '/stakeholder/estimate-builder': 'Estimate Builder',
  '/stakeholder/rate-card-management': 'Rate Card Management',
  '/stakeholder/feedback': 'Submit Feedback',
}

export function StakeholderHeader() {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Stakeholder Review'

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Stakeholder Review Portal
          <span className="mx-2 text-border">|</span>
          <span className="text-muted-foreground/70">DriveShop Event Estimate Engine</span>
        </p>
      </div>
      <Badge className="bg-blue-600 text-xs font-semibold tracking-wide hover:bg-blue-600">REVIEW</Badge>
    </header>
  )
}
