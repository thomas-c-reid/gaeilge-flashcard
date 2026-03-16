import { NavLink } from 'react-router-dom'
import { Home, PlusCircle, Settings } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/request', icon: PlusCircle, label: 'New Set' },
  { to: '/settings', icon: Settings, label: 'Settings' },
] as const

export default function BottomNav() {
  return (
    <nav className="flex bg-white border-t border-slate-200 pb-safe">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center h-16 gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-slate-400'
            }`
          }
        >
          <Icon size={22} strokeWidth={1.75} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
