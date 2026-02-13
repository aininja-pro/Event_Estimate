import { useState, useEffect } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Feedback } from '@/types/feedback'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function FeedbackPage() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editMessage, setEditMessage] = useState('')

  async function loadAllFeedback() {
    if (!supabase) return
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setAllFeedback(data as Feedback[])
  }

  useEffect(() => {
    loadAllFeedback()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!supabase) {
      setError('Feedback service is not configured. Please contact the administrator.')
      return
    }

    if (!name.trim() || !message.trim()) {
      setError('Name and comment are required.')
      return
    }

    setSubmitting(true)
    const { error: insertError } = await supabase
      .from('feedback')
      .insert({ name: name.trim(), category: 'General', message: message.trim() })

    setSubmitting(false)

    if (insertError) {
      setError(`Failed to submit: ${insertError.message}`)
      return
    }

    setMessage('')
    loadAllFeedback()
  }

  async function handleDelete(id: string) {
    if (!supabase) return
    await supabase.from('feedback').delete().eq('id', id)
    loadAllFeedback()
  }

  function startEdit(fb: Feedback) {
    setEditingId(fb.id)
    setEditMessage(fb.message)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditMessage('')
  }

  async function saveEdit(id: string) {
    if (!supabase || !editMessage.trim()) return
    await supabase.from('feedback').update({ message: editMessage.trim() }).eq('id', id)
    setEditingId(null)
    setEditMessage('')
    loadAllFeedback()
  }

  if (!supabase) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Unavailable</CardTitle>
          <CardDescription>
            The feedback service is not configured. Please contact the project administrator.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wishlist & Comments</CardTitle>
          <CardDescription>
            Share your thoughts on any of the review pages. All comments are visible to everyone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3 items-end">
              <div className="space-y-1 w-48 shrink-0">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1" />
              <Button type="submit" disabled={submitting} className="shrink-0">
                {submitting ? 'Submitting...' : 'Submit Comment'}
              </Button>
            </div>
            <div className="space-y-1">
              <Label htmlFor="message">Comment</Label>
              <Textarea
                id="message"
                placeholder="Type your comment, wish, or suggestion here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Comments ({allFeedback.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {allFeedback.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-4 font-medium text-muted-foreground w-40">Name</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">Comment</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground w-28 text-right">Date</th>
                    <th className="pb-2 font-medium text-muted-foreground w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allFeedback.map((fb) => (
                    <tr key={fb.id}>
                      <td className="py-3 pr-4 font-medium align-top">{fb.name}</td>
                      <td className="py-3 pr-4 align-top">
                        {editingId === fb.id ? (
                          <Textarea
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                            className="min-h-[80px]"
                            autoFocus
                          />
                        ) : (
                          <span className="whitespace-pre-wrap">{fb.message}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground text-right align-top">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 align-top">
                        <div className="flex gap-1 justify-end">
                          {editingId === fb.id ? (
                            <>
                              <button
                                onClick={() => saveEdit(fb.id)}
                                className="rounded p-1 text-green-500 hover:bg-green-500/10"
                                title="Save"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="rounded p-1 text-muted-foreground hover:bg-muted"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(fb)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(fb.id)}
                                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
