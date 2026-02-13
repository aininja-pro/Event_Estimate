import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { feedbackCategories, type Feedback, type FeedbackCategory } from '@/types/feedback'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | 'All'>('All')
  const [filterStatus, setFilterStatus] = useState<'All' | 'new' | 'reviewed'>('All')
  const [filterName, setFilterName] = useState('')

  async function loadFeedback() {
    if (!supabase) return
    setLoading(true)
    let query = supabase.from('feedback').select('*').order('created_at', { ascending: false })

    if (filterCategory !== 'All') {
      query = query.eq('category', filterCategory)
    }
    if (filterStatus !== 'All') {
      query = query.eq('status', filterStatus)
    }
    if (filterName.trim()) {
      query = query.ilike('name', `%${filterName.trim()}%`)
    }

    const { data } = await query
    setFeedback((data as Feedback[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadFeedback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterStatus, filterName])

  async function toggleStatus(fb: Feedback) {
    if (!supabase) return
    const newStatus = fb.status === 'new' ? 'reviewed' : 'new'
    await supabase.from('feedback').update({ status: newStatus }).eq('id', fb.id)
    loadFeedback()
  }

  if (!supabase) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedback Admin Unavailable</CardTitle>
            <CardDescription>
              The feedback service is not configured. Please set up Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feedback Management</CardTitle>
          <CardDescription>
            Review and manage stakeholder feedback. {feedback.length} item{feedback.length !== 1 ? 's' : ''} found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as FeedbackCategory | 'All')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {feedbackCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as 'All' | 'new' | 'reviewed')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input
                placeholder="Filter by name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-[180px]"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading feedback...</p>
          ) : feedback.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No feedback found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((fb) => (
                  <TableRow key={fb.id}>
                    <TableCell className="font-medium">{fb.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{fb.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] whitespace-normal">
                      {fb.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant={fb.status === 'reviewed' ? 'secondary' : 'default'}>
                        {fb.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(fb)}
                      >
                        {fb.status === 'new' ? 'Mark Reviewed' : 'Mark New'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
