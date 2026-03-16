import { AlertTriangle } from 'lucide-react'

export default function OfflineBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-400 text-slate-900 text-sm font-medium h-10 px-4 shrink-0">
      <AlertTriangle size={15} strokeWidth={2} />
      <span>Server unreachable — offline mode</span>
    </div>
  )
}
