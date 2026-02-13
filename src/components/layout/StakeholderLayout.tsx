import { Outlet } from 'react-router-dom'
import { StakeholderSidebar } from '@/components/layout/StakeholderSidebar'
import { StakeholderHeader } from '@/components/layout/StakeholderHeader'

export function StakeholderLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <StakeholderSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <StakeholderHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
