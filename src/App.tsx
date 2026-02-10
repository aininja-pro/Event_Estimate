import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { RateCardPage } from '@/pages/RateCardPage'
import { AIScopingPage } from '@/pages/AIScopingPage'
import { SystemArchitecturePage } from '@/pages/SystemArchitecturePage'
import { DatabaseSchemaPage } from '@/pages/DatabaseSchemaPage'
import { EstimateLifecyclePage } from '@/pages/EstimateLifecyclePage'
import { ComingSoonPage } from '@/pages/ComingSoonPage'

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
          <Route path="/phase2-roadmap" element={<ComingSoonPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
