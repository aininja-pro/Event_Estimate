import { Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function ComingSoonPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <Card className="max-w-md text-center">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <Construction className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold">Coming Soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This deliverable page is coming in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
