import type { LucideIcon } from 'lucide-react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ExpandableCardProps {
  icon: LucideIcon
  iconColor?: string
  title: string
  subtitle: string
  children: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
}

export function ExpandableCard({
  icon: Icon,
  iconColor = 'text-muted-foreground',
  title,
  subtitle,
  children,
  isExpanded,
  onToggle,
}: ExpandableCardProps) {
  return (
    <Card>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        className="flex cursor-pointer items-center gap-4 px-6 py-4"
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-none">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
      </div>
      {isExpanded && (
        <CardContent className="border-t pt-4">
          {children}
        </CardContent>
      )}
    </Card>
  )
}
