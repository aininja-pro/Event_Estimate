import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { StakeholderLayout } from '@/components/layout/StakeholderLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { RateCardPage } from '@/pages/RateCardPage'
import { AIScopingPage } from '@/pages/AIScopingPage'
import { SystemArchitecturePage } from '@/pages/SystemArchitecturePage'
import { DatabaseSchemaPage } from '@/pages/DatabaseSchemaPage'
import { EstimateLifecyclePage } from '@/pages/EstimateLifecyclePage'
import { Phase2RoadmapPage } from '@/pages/Phase2RoadmapPage'
import { EstimateBuilderPage } from '@/pages/EstimateBuilderPage'
import { RateCardManagementPage } from '@/pages/RateCardManagementPage'
import { FeedbackPage } from '@/pages/FeedbackPage'
import { AdminFeedbackPage } from '@/pages/AdminFeedbackPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rate-card" element={<RateCardPage />} />
          <Route path="/ai-assistant" element={<AIScopingPage />} />
          <Route path="/system-architecture" element={<SystemArchitecturePage />} />
          <Route path="/database-schema" element={<DatabaseSchemaPage />} />
          <Route path="/estimate-lifecycle" element={<EstimateLifecyclePage />} />
          <Route path="/phase2-roadmap" element={<Phase2RoadmapPage />} />
          <Route path="/estimate-builder" element={<EstimateBuilderPage />} />
          <Route path="/rate-card-management" element={<RateCardManagementPage />} />
          <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
        </Route>

        <Route path="/stakeholder" element={<StakeholderLayout />}>
          <Route index element={<Navigate to="/stakeholder/estimate-lifecycle" replace />} />
          <Route path="estimate-lifecycle" element={<EstimateLifecyclePage />} />
          <Route path="phase2-roadmap" element={<Phase2RoadmapPage />} />
          <Route path="estimate-builder" element={<EstimateBuilderPage />} />
          <Route path="rate-card-management" element={<RateCardManagementPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
