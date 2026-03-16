import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import CardStack, { type CardResult } from '../components/CardStack'
import ProgressBar from '../components/ProgressBar'
import { db, type Card } from '../db'
import { useSettings } from '../hooks/useSettings'

interface LocationState {
  cardIds?: string[]
}

export default function Play() {
  const { setId } = useParams<{ setId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { settings } = useSettings()

  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [setTitle, setSetTitle] = useState('')
  const [current, setCurrent] = useState(0)

  const state = location.state as LocationState | null
  const filteredIds = state?.cardIds

  useEffect(() => {
    if (!setId) return

    Promise.all([
      db.sets.get(setId),
      db.cards.where('setId').equals(setId).toArray(),
    ]).then(([set, allCards]) => {
      setSetTitle(set?.title ?? 'Flashcards')

      const filtered = filteredIds
        ? allCards.filter((c) => filteredIds.includes(c.id))
        : allCards

      setCards(filtered)
      setLoading(false)
    })
  }, [setId, filteredIds])

  const handleComplete = async (results: CardResult[]) => {
    // Persist stat increments to Dexie
    await Promise.all(
      results.map(({ cardId, correct }) =>
        db.cards
          .where('id')
          .equals(cardId)
          .modify((card) => {
            if (correct) {
              card.timesCorrect += 1
            } else {
              card.timesIncorrect += 1
            }
          }),
      ),
    )

    navigate(`/play/${setId}/complete`, {
      replace: true,
      state: { results, totalCards: cards.length },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] gap-4 px-6 text-center">
        <p className="text-slate-500 font-medium">No cards found for this set.</p>
        <button onClick={() => navigate('/')} className="text-primary font-semibold">
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-safe pt-4 pb-3 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2 mb-2.5">
          <button
            onClick={() => navigate('/')}
            className="p-1 -ml-1 rounded-lg text-slate-600"
            aria-label="Back to home"
          >
            <ArrowLeft size={22} />
          </button>
          <span className="font-semibold text-slate-800 truncate flex-1 text-center">
            {setTitle}
          </span>
          <span className="text-sm text-slate-500 shrink-0 min-w-[48px] text-right">
            {current} / {cards.length}
          </span>
        </div>
        <ProgressBar current={current} total={cards.length} />
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <CardStack
          cards={cards}
          cardFace={settings.cardFace}
          onComplete={handleComplete}
          onProgress={setCurrent}
        />
      </div>
    </div>
  )
}
