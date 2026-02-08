import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { RateCardPage } from '@/pages/RateCardPage'
import { AIScopingPage } from '@/pages/AIScopingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rate-card" element={<RateCardPage />} />
          <Route path="/ai-assistant" element={<AIScopingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
