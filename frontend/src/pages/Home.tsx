import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, Plus } from 'lucide-react'
import { db, type FlashcardSet } from '../db'

function SetCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/3" />
        </div>
        <div className="w-5 h-5 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

function formatRelativeDate(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3_600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86_400) return `${Math.floor(diff / 3_600)}h ago`
  if (diff < 604_800) return `${Math.floor(diff / 86_400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function Home() {
  const navigate = useNavigate()
  const [sets, setSets] = useState<FlashcardSet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.sets
      .orderBy('createdAt')
      .reverse()
      .toArray()
      .then((result) => {
        setSets(result)
        setLoading(false)
      })
  }, [])

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="text-xl font-bold text-slate-900 mb-6">
        Gaeilge Flashcards <span aria-hidden>🇮🇪</span>
      </h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          <SetCardSkeleton />
          <SetCardSkeleton />
          <SetCardSkeleton />
        </div>
      ) : sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen size={48} className="text-slate-300 mb-4" strokeWidth={1.5} />
          <p className="font-semibold text-slate-600 mb-1">No sets yet</p>
          <p className="text-sm text-slate-400 mb-6">
            Generate your first flashcard set to get started.
          </p>
          <button
            onClick={() => navigate('/request')}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium text-sm"
          >
            <Plus size={16} />
            Create a set
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sets.map((set) => (
            <button
              key={set.id}
              onClick={() => navigate(`/play/${set.id}`)}
              className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 text-left w-full active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-primary" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{set.title}</p>
                <p className="text-sm text-slate-500">
                  {set.cardCount} cards · {formatRelativeDate(set.createdAt)}
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
