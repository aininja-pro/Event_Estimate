import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

export function AIScopingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Scoping Assistant</CardTitle>
        <CardDescription>
          Generate event scope estimates powered by AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Claude-powered event scope estimator coming in Phase 3.
        </p>
      </CardContent>
    </Card>
  )
}
