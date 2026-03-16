import { useNavigate, useParams, useLocation } from 'react-router-dom'
import type { CardResult } from '../components/CardStack'

interface LocationState {
  results: CardResult[]
  totalCards: number
}

export default function Complete() {
  const navigate = useNavigate()
  const { setId } = useParams<{ setId: string }>()
  const location = useLocation()
  const state = location.state as LocationState | null

  // Guard: if navigated here directly without state, go home
  if (!state) {
    navigate('/', { replace: true })
    return null
  }

  const { results, totalCards } = state
  const correctCount = results.filter((r) => r.correct).length
  const incorrectIds = results.filter((r) => !r.correct).map((r) => r.cardId)
  const allCorrect = incorrectIds.length === 0
  const isPerfect = correctCount === totalCards

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-50 px-6 text-center">
      <div className="text-6xl mb-4" aria-hidden>
        {isPerfect ? '🏆' : '🎉'}
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        {isPerfect ? 'Perfect score!' : 'Set complete!'}
      </h1>

      <p className="text-lg text-slate-600 mb-1">
        Well done!{' '}
        <span className="font-bold text-primary">
          {correctCount}/{totalCards}
        </span>{' '}
        correct
      </p>

      {!allCorrect && (
        <p className="text-sm text-slate-400 mb-8">
          {incorrectIds.length} card{incorrectIds.length !== 1 ? 's' : ''} to review
        </p>
      )}
      {allCorrect && <div className="mb-8" />}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate(`/play/${setId}`, { replace: true, state: {} })}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold"
        >
          Start Again
        </button>

        {!allCorrect && (
          <button
            onClick={() =>
              navigate(`/play/${setId}`, {
                replace: true,
                state: { cardIds: incorrectIds },
              })
            }
            className="w-full border-2 border-primary text-primary py-3.5 rounded-xl font-semibold"
          >
            Continue with Incorrect ({incorrectIds.length})
          </button>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full text-slate-500 py-3 rounded-xl font-medium"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
