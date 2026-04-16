import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '@/lib/notification-service'

export function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const loadNotifications = useCallback(async () => {
    if (!user) return
    const [items, count] = await Promise.all([
      getNotifications(user.id),
      getUnreadCount(user.id),
    ])
    setNotifications(items)
    setUnreadCount(count)
  }, [user])

  // Initial load
  useEffect(() => {
    loadNotifications() // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadNotifications])

  // Subscribe to realtime inserts for this user
  useEffect(() => {
    if (!supabase || !user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          loadNotifications()
          // Pop a toast so the user notices the update even if they're not
          // looking at the bell. Clicking navigates to the estimate.
          const n = payload.new as Notification
          const variant = n.type === 'approval_decision' ? 'success' : 'info'
          const go = () => {
            if (!n.is_read) markAsRead(n.id).catch(() => {})
            if (n.estimate_id) {
              navigate(`/estimates/${n.estimate_id}`)
            }
          }
          toast[variant](n.title, {
            description: n.body,
            duration: 6000,
            action: n.estimate_id
              ? { label: 'Open', onClick: go }
              : undefined,
          })
        }
      )
      .subscribe()

    return () => {
      supabase!.removeChannel(channel)
    }
  }, [user, loadNotifications, navigate])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleMarkRead(n: Notification) {
    if (!n.is_read) {
      await markAsRead(n.id)
      await loadNotifications()
    }
    if (n.estimate_id) {
      navigate(`/estimates/${n.estimate_id}`)
      setOpen(false)
    }
  }

  async function handleMarkAllRead() {
    if (!user) return
    await markAllAsRead(user.id)
    await loadNotifications()
  }

  if (!user) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-popover shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleMarkRead(n)}
                  className={`flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-accent ${
                    !n.is_read ? 'bg-accent/30' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] leading-tight ${!n.is_read ? 'font-medium' : 'text-muted-foreground'}`}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-2">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      {formatRelativeTime(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}
