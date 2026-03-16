import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import OfflineBanner from './OfflineBanner'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useSync } from '../hooks/useSync'

export default function Layout() {
  const isOnline = useOnlineStatus()
  useSync(isOnline)

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      {!isOnline && <OfflineBanner />}
      <BottomNav />
    </div>
  )
}
