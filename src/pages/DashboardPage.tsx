import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

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
      </CardContent>
    </Card>
  )
}
