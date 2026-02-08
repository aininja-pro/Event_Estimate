import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

export function RateCardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Card Explorer</CardTitle>
        <CardDescription>
          Browse labor roles, rate ranges, and GL codes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          136 labor roles with rate ranges and GL codes coming in Phase 2.
        </p>
      </CardContent>
    </Card>
  )
}
