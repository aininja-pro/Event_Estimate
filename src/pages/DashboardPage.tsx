import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { getExecutiveSummary } from '@/lib/data'

const executive = getExecutiveSummary()

export function DashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Intelligence Dashboard</CardTitle>
        <CardDescription>
          Analyze historical event estimates and performance data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Executive Summary, Cost Analysis, Bid vs Actual, Event Manager
          Performance tabs coming in Phase 2.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold">{executive.totalEvents.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${(executive.totalRevenue / 1_000_000).toFixed(1)}M
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Events with Recap</p>
              <p className="text-2xl font-bold">{executive.eventsWithRecap.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
