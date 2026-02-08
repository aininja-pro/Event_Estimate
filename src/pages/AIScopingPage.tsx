import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles } from 'lucide-react'
import { getAIContext } from '@/lib/data'

const aiContext = getAIContext()

const EVENT_TYPES = [
  'Auto Show',
  'Ride & Drive',
  'Brand Activation',
  'Product Launch',
  'Corporate Event',
  'Experiential Marketing',
  'Other',
]

const BUDGET_RANGES = [
  'Under $10K',
  '$10K-$25K',
  '$25K-$50K',
  '$50K-$100K',
  '$100K+',
]

const SECTIONS = aiContext.sections.map((s) => s.name)

export function AIScopingPage() {
  const [eventName, setEventName] = useState('')
  const [eventType, setEventType] = useState('')
  const [duration, setDuration] = useState('')
  const [attendance, setAttendance] = useState('')
  const [location, setLocation] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [selectedSections, setSelectedSections] = useState<string[]>([...SECTIONS])
  const [specialRequirements, setSpecialRequirements] = useState('')

  function handleSectionToggle(section: string) {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // API integration will be wired in Task 2
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Scoping Assistant</h1>
        <p className="text-muted-foreground">
          Generate data-backed event scope estimates powered by Claude and 1,659 historical events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  placeholder="e.g. CES 2025 Auto Show"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={eventType} onValueChange={setEventType} required>
                  <SelectTrigger id="eventType" className="w-full">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={14}
                  placeholder="e.g. 3"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance">Estimated Attendance</Label>
                <Input
                  id="attendance"
                  type="number"
                  min={1}
                  placeholder="e.g. 5000"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location / Market</Label>
                <Input
                  id="location"
                  placeholder="e.g. Las Vegas, NV"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetRange">Budget Range</Label>
                <Select value={budgetRange} onValueChange={setBudgetRange}>
                  <SelectTrigger id="budgetRange" className="w-full">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sections to Include</Label>
              <div className="flex flex-wrap gap-3">
                {SECTIONS.map((section) => (
                  <label
                    key={section}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section)}
                      onChange={() => handleSectionToggle(section)}
                      className="rounded border-input"
                    />
                    {section}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequirements">Special Requirements</Label>
              <Textarea
                id="specialRequirements"
                placeholder="Any specific needs, constraints, or notes for this event..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" size="lg">
              <Sparkles className="size-4" />
              Generate Scope Estimate
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
