import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Settings as SettingsIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  getApprovalThreshold,
  getGPThreshold,
  updateSystemSetting,
  getSettingAudit,
  type SystemSettingAudit,
} from '@/lib/system-settings-service'

interface Baseline {
  gpThreshold: number
  approvalThreshold: number
}

function formatAudit(audit: SystemSettingAudit): string | null {
  if (!audit.updated_at) return null
  const when = new Date(audit.updated_at).toLocaleString()
  const who = audit.updated_by_name ? ` by ${audit.updated_by_name}` : ''
  return `Last updated ${when}${who}`
}

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [baseline, setBaseline] = useState<Baseline | null>(null)
  const [gpThreshold, setGpThreshold] = useState<string>('')
  const [approvalThreshold, setApprovalThreshold] = useState<string>('')
  const [gpAudit, setGpAudit] = useState<SystemSettingAudit>({ updated_at: null, updated_by_name: null })
  const [approvalAudit, setApprovalAudit] = useState<SystemSettingAudit>({ updated_at: null, updated_by_name: null })
  const [validationError, setValidationError] = useState<string | null>(null)

  async function loadAll() {
    const [gp, appr, gpAud, apprAud] = await Promise.all([
      getGPThreshold(),
      getApprovalThreshold(),
      getSettingAudit('gp_threshold_pct'),
      getSettingAudit('approval_threshold'),
    ])
    setBaseline({ gpThreshold: gp, approvalThreshold: appr })
    setGpThreshold(String(gp))
    setApprovalThreshold(String(appr))
    setGpAudit(gpAud)
    setApprovalAudit(apprAud)
    setLoading(false)
  }

  useEffect(() => { loadAll() }, []) // eslint-disable-line react-hooks/set-state-in-effect

  const gpValue = Number(gpThreshold)
  const approvalValue = Number(approvalThreshold)

  const gpValid =
    gpThreshold.trim() !== '' &&
    Number.isFinite(gpValue) &&
    gpValue >= 0 &&
    gpValue <= 100
  const approvalValid =
    approvalThreshold.trim() !== '' &&
    Number.isFinite(approvalValue) &&
    Number.isInteger(approvalValue) &&
    approvalValue >= 0

  const dirty =
    baseline !== null &&
    (gpValue !== baseline.gpThreshold || approvalValue !== baseline.approvalThreshold)

  async function handleSave() {
    setValidationError(null)

    if (!gpValid) {
      setValidationError('GP% must be a number between 0 and 100.')
      return
    }
    if (!approvalValid) {
      setValidationError('Approval threshold must be a whole dollar amount of 0 or greater.')
      return
    }

    setSaving(true)

    const results: string[] = []

    if (baseline && gpValue !== baseline.gpThreshold) {
      const res = await updateSystemSetting('gp_threshold_pct', { pct: gpValue })
      if (!res.success) {
        toast.error(`Failed to save GP threshold: ${res.error ?? 'Unknown error'}`)
        setSaving(false)
        return
      }
      results.push('GP threshold')
    }

    if (baseline && approvalValue !== baseline.approvalThreshold) {
      const res = await updateSystemSetting('approval_threshold', {
        amount: approvalValue,
        currency: 'USD',
      })
      if (!res.success) {
        toast.error(`Failed to save approval threshold: ${res.error ?? 'Unknown error'}`)
        setSaving(false)
        return
      }
      results.push('Approval threshold')
    }

    setSaving(false)
    toast.success(`Saved: ${results.join(', ')}`)
    await loadAll()
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading settings...</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-5 w-5 text-muted-foreground" />
        <div>
          <h2 className="text-base font-semibold">System Settings</h2>
          <p className="text-[13px] text-muted-foreground">
            Configure global thresholds used across the estimating workflow.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Financial Thresholds</CardTitle>
          <CardDescription className="text-[13px]">
            Changes take effect on the next page load for already-open estimates. The approval gate
            picks up changes immediately on the next submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="gp-threshold" className="text-[10px] uppercase tracking-wider">
              GP% Minimum Threshold
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="gp-threshold"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={gpThreshold}
                onChange={(e) => setGpThreshold(e.target.value)}
                className="w-32 text-[13px]"
              />
              <span className="text-[13px] text-muted-foreground">%</span>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Summary tab shows an amber warning when an estimate's GP% falls below this value. Default 20%.
            </p>
            {formatAudit(gpAudit) && (
              <p className="text-[11px] text-muted-foreground">{formatAudit(gpAudit)}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="approval-threshold" className="text-[10px] uppercase tracking-wider">
              Executive Approval Threshold
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-muted-foreground">$</span>
              <Input
                id="approval-threshold"
                type="number"
                step="1"
                min="0"
                value={approvalThreshold}
                onChange={(e) => setApprovalThreshold(e.target.value)}
                className="w-40 text-[13px]"
              />
            </div>
            <p className="text-[12px] text-muted-foreground">
              Estimates at or above this total require executive review after AM approval. Default $50,000.
            </p>
            {formatAudit(approvalAudit) && (
              <p className="text-[11px] text-muted-foreground">{formatAudit(approvalAudit)}</p>
            )}
          </div>

          {validationError && (
            <p className="text-[13px] text-destructive">{validationError}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !dirty || !gpValid || !approvalValid}
              className="bg-emerald-700 text-white hover:bg-emerald-600"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            {!dirty && !saving && (
              <span className="text-[12px] text-muted-foreground">No changes to save.</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
