import { useLocation } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Historical Intelligence Dashboard',
  '/rate-card': 'Historical Rate Analysis',
  '/ai-assistant': 'AI Scoping Assistant',
}

export function Header() {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Event Estimate Engine'

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Phase 1 Discovery Intelligence Report
        </p>
      </div>
      <Badge variant="destructive">CONFIDENTIAL</Badge>
    </header>
  )
}
