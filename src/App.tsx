import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/lib/auth'
import { AppLayout } from '@/components/layout/AppLayout'
import { StakeholderLayout } from '@/components/layout/StakeholderLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { PipelineDashboardPage } from '@/pages/PipelineDashboardPage'
import { RateCardPage } from '@/pages/RateCardPage'
import { AIScopingPage } from '@/pages/AIScopingPage'
import { SystemArchitecturePage } from '@/pages/SystemArchitecturePage'
import { DatabaseSchemaPage } from '@/pages/DatabaseSchemaPage'
import { EstimateLifecyclePage } from '@/pages/EstimateLifecyclePage'
import { Phase2RoadmapPage } from '@/pages/Phase2RoadmapPage'
import { EstimatesListPage } from '@/pages/EstimatesListPage'
import { EstimateBuilderPage } from '@/pages/EstimateBuilderPage'
import { RateCardManagementPage } from '@/pages/RateCardManagementPage'
import { FeedbackPage } from '@/pages/FeedbackPage'
import { AdminFeedbackPage } from '@/pages/AdminFeedbackPage'
import { LoginPage } from '@/pages/LoginPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { AdminSettingsPage } from '@/pages/AdminSettingsPage'
import { AccountingSetupPage } from '@/pages/AccountingSetupPage'
import { hasPermission } from '@/lib/permissions'

function RequireAuth() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <Outlet />
}

function RequireAdmin() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/estimates" replace />
  }

  return <Outlet />
}

function RequireAccountingSetup() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!profile || !hasPermission(profile.role, 'edit_accounting_mappings')) {
    return <Navigate to="/estimates" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/estimates" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pipeline-dashboard" element={<PipelineDashboardPage />} />
              <Route path="/rate-card" element={<RateCardPage />} />
              <Route path="/ai-assistant" element={<AIScopingPage />} />
              <Route path="/system-architecture" element={<SystemArchitecturePage />} />
              <Route path="/database-schema" element={<DatabaseSchemaPage />} />
              <Route path="/estimate-lifecycle" element={<EstimateLifecyclePage />} />
              <Route path="/phase2-roadmap" element={<Phase2RoadmapPage />} />
              <Route path="/estimates" element={<EstimatesListPage />} />
              <Route path="/estimates/:id" element={<EstimateBuilderPage />} />
              <Route path="/estimate-builder" element={<EstimateBuilderPage />} />
              <Route path="/rate-card-management" element={<RateCardManagementPage />} />
              <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
              <Route element={<RequireAccountingSetup />}>
                <Route path="/admin/accounting-setup" element={<AccountingSetupPage />} />
              </Route>

              <Route element={<RequireAdmin />}>
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>

            <Route path="/stakeholder" element={<StakeholderLayout />}>
              <Route index element={<Navigate to="/stakeholder/estimate-lifecycle" replace />} />
              <Route path="estimate-lifecycle" element={<EstimateLifecyclePage />} />
              <Route path="phase2-roadmap" element={<Phase2RoadmapPage />} />
              <Route path="estimate-builder" element={<EstimateBuilderPage />} />
              <Route path="rate-card-management" element={<RateCardManagementPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
