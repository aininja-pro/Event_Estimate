import { useState, useEffect } from 'react'
import { supabase, createIsolatedClient } from '@/lib/supabase'
import type { Profile } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { UserPlus, Shield, ShieldOff, Trash2 } from 'lucide-react'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'cfo', label: 'CFO' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'operations', label: 'Operations' },
  { value: 'production_manager', label: 'Production Manager' },
  { value: 'account_manager', label: 'Account Manager' },
] as const

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-amber-100 text-amber-800 border border-amber-300',
  cfo: 'bg-blue-100 text-blue-800 border border-blue-300',
  accounting: 'bg-teal-100 text-teal-800 border border-teal-300',
  operations: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  production_manager: 'bg-violet-100 text-violet-800 border border-violet-300',
  account_manager: 'bg-zinc-100 text-zinc-700 border border-zinc-300',
}

export function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<string>('account_manager')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function loadProfiles() {
    if (!supabase) return
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error && data) setProfiles(data as Profile[])
    setLoading(false)
  }

  useEffect(() => { loadProfiles() }, []) // eslint-disable-line react-hooks/set-state-in-effect

  async function handleInvite() {
    if (!inviteEmail || !inviteName || !invitePassword) return
    setInviting(true)
    setInviteError(null)

    // Use an isolated Supabase client so signUp doesn't swap the admin's session
    const isolated = createIsolatedClient()
    if (!isolated) {
      setInviteError('Supabase is not configured')
      setInviting(false)
      return
    }

    const { data: signUpData, error } = await isolated.auth.signUp({
      email: inviteEmail,
      password: invitePassword,
      options: {
        data: {
          full_name: inviteName,
          role: inviteRole,
        },
      },
    })

    if (error?.message === 'User already registered') {
      // Auth user exists but profile was deleted — sign in to get user ID, then re-create profile
      const { data: signInData, error: signInError } = await isolated.auth.signInWithPassword({
        email: inviteEmail,
        password: invitePassword,
      })

      if (signInError) {
        setInviteError('User exists in auth with a different password. Delete them from the Supabase Auth dashboard first.')
        setInviting(false)
        return
      }

      if (signInData.user && supabase) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: signInData.user.id,
          email: inviteEmail,
          full_name: inviteName,
          role: inviteRole,
          is_active: true,
        })
        if (profileError) {
          setInviteError(profileError.message)
          setInviting(false)
          return
        }
      }
    } else if (error) {
      setInviteError(error.message)
      setInviting(false)
      return
    } else if (signUpData.user && supabase) {
      // New user — ensure profile exists (trigger may handle this, but upsert is safe)
      await supabase.from('profiles').upsert({
        id: signUpData.user.id,
        email: inviteEmail,
        full_name: inviteName,
        role: inviteRole,
        is_active: true,
      })
    }

    setInviting(false)

    setInviteOpen(false)
    setInviteEmail('')
    setInviteName('')
    setInviteRole('account_manager')
    setInvitePassword('')
    await loadProfiles()
  }

  async function toggleActive(profile: Profile) {
    if (!supabase) return
    await supabase
      .from('profiles')
      .update({ is_active: !profile.is_active })
      .eq('id', profile.id)
    await loadProfiles()
  }

  async function updateRole(profileId: string, newRole: string) {
    if (!supabase) return
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId)
    await loadProfiles()
  }

  async function handleDelete() {
    if (!supabase || !deleteTarget) return
    setDeleting(true)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', deleteTarget.id)
    if (error) {
      console.error('Delete profile failed:', error)
    }
    setDeleteTarget(null)
    setDeleting(false)
    await loadProfiles()
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Team Members</h2>
          <p className="text-sm text-muted-foreground">{profiles.length} users</p>
        </div>
        <Button
          size="sm"
          onClick={() => setInviteOpen(true)}
          className="gap-1.5 bg-emerald-700 text-white hover:bg-emerald-600"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite User
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px] uppercase tracking-wider">Name</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Email</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Role</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => (
              <TableRow key={p.id} className={!p.is_active ? 'opacity-50' : ''}>
                <TableCell className="text-[13px] font-medium">{p.full_name}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground">{p.email}</TableCell>
                <TableCell>
                  <select
                    value={p.role}
                    onChange={(e) => updateRole(p.id, e.target.value)}
                    className={`rounded px-2 py-0.5 text-[11px] font-medium ${ROLE_COLORS[p.role] || 'bg-zinc-800 text-zinc-300'} border-0 cursor-pointer`}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    p.is_active
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    {p.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => toggleActive(p)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title={p.is_active ? 'Deactivate user' : 'Activate user'}
                    >
                      {p.is_active ? (
                        <><ShieldOff className="h-3 w-3" /> Deactivate</>
                      ) : (
                        <><Shield className="h-3 w-3" /> Activate</>
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                      title="Delete user"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Delete User</DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.full_name}</span> ({deleteTarget?.email})? This removes their profile from the application.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} className="text-[13px]">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-[13px] bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Create a new account for a team member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {inviteError && (
              <div className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
                {inviteError}
              </div>
            )}

            <div>
              <Label className="text-xs">Full Name</Label>
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Tatiana Smith"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="e.g. tatiana@driveshop.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Temporary Password</Label>
              <Input
                type="text"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                placeholder="Set an initial password"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Role</Label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail || !inviteName || !invitePassword}
              className="bg-emerald-700 text-white hover:bg-emerald-600"
            >
              {inviting ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
