import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Landmark, Plus, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  createOfficeAccountingProfile,
  createRevenueSegment,
  getOfficeAccountingProfiles,
  getRevenueSegments,
  updateOfficeAccountingProfile,
  updateRevenueSegment,
} from '@/lib/rate-card-service'
import type {
  OfficeAccountingProfile,
  OfficeAccountingProfileInsert,
  RevenueSegment,
  RevenueSegmentInsert,
} from '@/types/accounting'

type RevenueSegmentDraft = Pick<RevenueSegment, 'name' | 'code' | 'active' | 'sort_order'>
type OfficeProfileDraft = Pick<
  OfficeAccountingProfile,
  'office_name' | 'legal_name' | 'intacct_vendor_id' | 'default_payment_terms' | 'default_department_id' | 'default_location_id' | 'active'
>

const emptyRevenueSegment: RevenueSegmentDraft = {
  name: '',
  code: '',
  active: true,
  sort_order: 0,
}

const emptyOfficeProfile: OfficeProfileDraft = {
  office_name: '',
  legal_name: '',
  intacct_vendor_id: '',
  default_payment_terms: '',
  default_department_id: '',
  default_location_id: '',
  active: true,
}

function cleanString(value: string | null): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed || null
}

function revenueDraftFrom(row: RevenueSegment): RevenueSegmentDraft {
  return {
    name: row.name,
    code: row.code ?? '',
    active: row.active,
    sort_order: row.sort_order ?? 0,
  }
}

function officeDraftFrom(row: OfficeAccountingProfile): OfficeProfileDraft {
  return {
    office_name: row.office_name,
    legal_name: row.legal_name ?? '',
    intacct_vendor_id: row.intacct_vendor_id ?? '',
    default_payment_terms: row.default_payment_terms ?? '',
    default_department_id: row.default_department_id ?? '',
    default_location_id: row.default_location_id ?? '',
    active: row.active,
  }
}

export function AccountingSetupPage() {
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [revenueSegments, setRevenueSegments] = useState<RevenueSegment[]>([])
  const [officeProfiles, setOfficeProfiles] = useState<OfficeAccountingProfile[]>([])
  const [revenueDrafts, setRevenueDrafts] = useState<Record<string, RevenueSegmentDraft>>({})
  const [officeDrafts, setOfficeDrafts] = useState<Record<string, OfficeProfileDraft>>({})
  const [newRevenueSegment, setNewRevenueSegment] = useState<RevenueSegmentDraft>(emptyRevenueSegment)
  const [newOfficeProfile, setNewOfficeProfile] = useState<OfficeProfileDraft>(emptyOfficeProfile)

  async function loadData() {
    setLoading(true)
    try {
      const [segments, profiles] = await Promise.all([
        getRevenueSegments(true),
        getOfficeAccountingProfiles(true),
      ])
      setRevenueSegments(segments)
      setOfficeProfiles(profiles)
      setRevenueDrafts(Object.fromEntries(segments.map((segment) => [segment.id, revenueDraftFrom(segment)])))
      setOfficeDrafts(Object.fromEntries(profiles.map((profile) => [profile.id, officeDraftFrom(profile)])))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load accounting setup.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/set-state-in-effect

  async function handleCreateRevenueSegment() {
    if (!newRevenueSegment.name.trim()) {
      toast.error('Revenue segment name is required.')
      return
    }

    setSavingKey('new-revenue-segment')
    try {
      const payload: RevenueSegmentInsert = {
        name: newRevenueSegment.name.trim(),
        code: cleanString(newRevenueSegment.code),
        active: newRevenueSegment.active,
        sort_order: Number.isFinite(Number(newRevenueSegment.sort_order)) ? Number(newRevenueSegment.sort_order) : 0,
      }
      await createRevenueSegment(payload)
      setNewRevenueSegment(emptyRevenueSegment)
      toast.success('Revenue segment created.')
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create revenue segment.')
    } finally {
      setSavingKey(null)
    }
  }

  async function handleSaveRevenueSegment(id: string) {
    const draft = revenueDrafts[id]
    if (!draft?.name.trim()) {
      toast.error('Revenue segment name is required.')
      return
    }

    setSavingKey(`revenue-${id}`)
    try {
      await updateRevenueSegment(id, {
        name: draft.name.trim(),
        code: cleanString(draft.code),
        active: draft.active,
        sort_order: Number.isFinite(Number(draft.sort_order)) ? Number(draft.sort_order) : 0,
      })
      toast.success('Revenue segment saved.')
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save revenue segment.')
    } finally {
      setSavingKey(null)
    }
  }

  async function handleCreateOfficeProfile() {
    if (!newOfficeProfile.office_name.trim()) {
      toast.error('Office profile name is required.')
      return
    }

    setSavingKey('new-office-profile')
    try {
      const payload: OfficeAccountingProfileInsert = {
        office_name: newOfficeProfile.office_name.trim(),
        legal_name: cleanString(newOfficeProfile.legal_name),
        intacct_vendor_id: cleanString(newOfficeProfile.intacct_vendor_id),
        default_payment_terms: cleanString(newOfficeProfile.default_payment_terms),
        default_department_id: cleanString(newOfficeProfile.default_department_id),
        default_location_id: cleanString(newOfficeProfile.default_location_id),
        active: newOfficeProfile.active,
      }
      await createOfficeAccountingProfile(payload)
      setNewOfficeProfile(emptyOfficeProfile)
      toast.success('Office profile created.')
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create office profile.')
    } finally {
      setSavingKey(null)
    }
  }

  async function handleSaveOfficeProfile(id: string) {
    const draft = officeDrafts[id]
    if (!draft?.office_name.trim()) {
      toast.error('Office profile name is required.')
      return
    }

    setSavingKey(`office-${id}`)
    try {
      await updateOfficeAccountingProfile(id, {
        office_name: draft.office_name.trim(),
        legal_name: cleanString(draft.legal_name),
        intacct_vendor_id: cleanString(draft.intacct_vendor_id),
        default_payment_terms: cleanString(draft.default_payment_terms),
        default_department_id: cleanString(draft.default_department_id),
        default_location_id: cleanString(draft.default_location_id),
        active: draft.active,
      })
      toast.success('Office profile saved.')
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save office profile.')
    } finally {
      setSavingKey(null)
    }
  }

  const inputClass = 'h-8 text-[13px]'
  const headClass = 'text-[10px] uppercase tracking-wider'

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading accounting setup...</div>
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center gap-2">
        <Landmark className="h-5 w-5 text-muted-foreground" />
        <div>
          <h2 className="text-base font-semibold">Accounting Setup</h2>
          <p className="text-[13px] text-muted-foreground">
            Manage the reference data required for Intacct upload readiness.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Revenue Segments</CardTitle>
          <CardDescription className="text-[13px]">
            Accounting classifications used by Office Event AR upload readiness.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[1.6fr_1fr_120px_90px_110px] gap-2 items-end">
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Name</Label>
              <Input value={newRevenueSegment.name} onChange={(e) => setNewRevenueSegment((prev) => ({ ...prev, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Code</Label>
              <Input value={newRevenueSegment.code ?? ''} onChange={(e) => setNewRevenueSegment((prev) => ({ ...prev, code: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Sort Order</Label>
              <Input type="number" value={newRevenueSegment.sort_order} onChange={(e) => setNewRevenueSegment((prev) => ({ ...prev, sort_order: Number(e.target.value) }))} className={inputClass} />
            </div>
            <label className="flex h-8 items-center gap-2 text-[13px] text-muted-foreground">
              <input type="checkbox" checked={newRevenueSegment.active} onChange={(e) => setNewRevenueSegment((prev) => ({ ...prev, active: e.target.checked }))} />
              Active
            </label>
            <Button size="sm" onClick={handleCreateRevenueSegment} disabled={savingKey !== null} className="h-8 gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={headClass}>Name</TableHead>
                <TableHead className={headClass}>Code</TableHead>
                <TableHead className={headClass}>Sort</TableHead>
                <TableHead className={headClass}>Active</TableHead>
                <TableHead className={`${headClass} text-right`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueSegments.map((segment) => {
                const draft = revenueDrafts[segment.id] ?? revenueDraftFrom(segment)
                return (
                  <TableRow key={segment.id} className={!draft.active ? 'opacity-55' : ''}>
                    <TableCell><Input value={draft.name} onChange={(e) => setRevenueDrafts((prev) => ({ ...prev, [segment.id]: { ...draft, name: e.target.value } }))} className={inputClass} /></TableCell>
                    <TableCell><Input value={draft.code ?? ''} onChange={(e) => setRevenueDrafts((prev) => ({ ...prev, [segment.id]: { ...draft, code: e.target.value } }))} className={inputClass} /></TableCell>
                    <TableCell><Input type="number" value={draft.sort_order} onChange={(e) => setRevenueDrafts((prev) => ({ ...prev, [segment.id]: { ...draft, sort_order: Number(e.target.value) } }))} className={`${inputClass} w-24`} /></TableCell>
                    <TableCell>
                      <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
                        <input type="checkbox" checked={draft.active} onChange={(e) => setRevenueDrafts((prev) => ({ ...prev, [segment.id]: { ...draft, active: e.target.checked } }))} />
                        {draft.active ? 'Active' : 'Inactive'}
                      </label>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => handleSaveRevenueSegment(segment.id)} disabled={savingKey !== null} className="h-8 gap-1">
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {revenueSegments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-[13px] text-muted-foreground">
                    No revenue segments configured yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Office Accounting Profiles</CardTitle>
          <CardDescription className="text-[13px]">
            Office/vendor profiles used by Office Event AP bill upload readiness.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr_1fr_90px_110px] gap-2 items-end">
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Office Name</Label>
              <Input value={newOfficeProfile.office_name} onChange={(e) => setNewOfficeProfile((prev) => ({ ...prev, office_name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Legal Name</Label>
              <Input value={newOfficeProfile.legal_name ?? ''} onChange={(e) => setNewOfficeProfile((prev) => ({ ...prev, legal_name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Vendor ID</Label>
              <Input value={newOfficeProfile.intacct_vendor_id ?? ''} onChange={(e) => setNewOfficeProfile((prev) => ({ ...prev, intacct_vendor_id: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Payment Terms</Label>
              <Input value={newOfficeProfile.default_payment_terms ?? ''} onChange={(e) => setNewOfficeProfile((prev) => ({ ...prev, default_payment_terms: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Department</Label>
              <Input value={newOfficeProfile.default_department_id ?? ''} onChange={(e) => setNewOfficeProfile((prev) => ({ ...prev, default_department_id: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider">Location</Label>
              <Input value={newOfficeProfile.default_location_id ?? ''} onChange={(e) => setNewOfficeProfile((prev) => ({ ...prev, default_location_id: e.target.value }))} className={inputClass} />
            </div>
            <label className="flex h-8 items-center gap-2 text-[13px] text-muted-foreground">
              <input type="checkbox" checked={newOfficeProfile.active} onChange={(e) => setNewOfficeProfile((prev) => ({ ...prev, active: e.target.checked }))} />
              Active
            </label>
            <Button size="sm" onClick={handleCreateOfficeProfile} disabled={savingKey !== null} className="h-8 gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={headClass}>Office</TableHead>
                <TableHead className={headClass}>Legal Name</TableHead>
                <TableHead className={headClass}>Vendor ID</TableHead>
                <TableHead className={headClass}>Terms</TableHead>
                <TableHead className={headClass}>Dept</TableHead>
                <TableHead className={headClass}>Location</TableHead>
                <TableHead className={headClass}>Active</TableHead>
                <TableHead className={`${headClass} text-right`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {officeProfiles.map((profile) => {
                const draft = officeDrafts[profile.id] ?? officeDraftFrom(profile)
                return (
                  <TableRow key={profile.id} className={!draft.active ? 'opacity-55' : ''}>
                    <TableCell><Input value={draft.office_name} onChange={(e) => setOfficeDrafts((prev) => ({ ...prev, [profile.id]: { ...draft, office_name: e.target.value } }))} className={inputClass} /></TableCell>
                    <TableCell><Input value={draft.legal_name ?? ''} onChange={(e) => setOfficeDrafts((prev) => ({ ...prev, [profile.id]: { ...draft, legal_name: e.target.value } }))} className={inputClass} /></TableCell>
                    <TableCell><Input value={draft.intacct_vendor_id ?? ''} onChange={(e) => setOfficeDrafts((prev) => ({ ...prev, [profile.id]: { ...draft, intacct_vendor_id: e.target.value } }))} className={inputClass} /></TableCell>
                    <TableCell><Input value={draft.default_payment_terms ?? ''} onChange={(e) => setOfficeDrafts((prev) => ({ ...prev, [profile.id]: { ...draft, default_payment_terms: e.target.value } }))} className={inputClass} /></TableCell>
                    <TableCell><Input value={draft.default_department_id ?? ''} onChange={(e) => setOfficeDrafts((prev) => ({ ...prev, [profile.id]: { ...draft, default_department_id: e.target.value } }))} className={inputClass} /></TableCell>
                    <TableCell><Input value={draft.default_location_id ?? ''} onChange={(e) => setOfficeDrafts((prev) => ({ ...prev, [profile.id]: { ...draft, default_location_id: e.target.value } }))} className={inputClass} /></TableCell>
                    <TableCell>
                      <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
                        <input type="checkbox" checked={draft.active} onChange={(e) => setOfficeDrafts((prev) => ({ ...prev, [profile.id]: { ...draft, active: e.target.checked } }))} />
                        {draft.active ? 'Active' : 'Inactive'}
                      </label>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => handleSaveOfficeProfile(profile.id)} disabled={savingKey !== null} className="h-8 gap-1">
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {officeProfiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-[13px] text-muted-foreground">
                    No office accounting profiles configured yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
