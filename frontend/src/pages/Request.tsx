import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Sparkles } from 'lucide-react'
import { generateSet } from '../api/client'
import { db } from '../db'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

const MIN_CARDS = 10
const MAX_CARDS = 50
const STEP = 5

export default function Request() {
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()
  const inputRef = useRef<HTMLInputElement>(null)

  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(20)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // iOS PWA requires explicit focus call — autofocus attribute alone is unreliable
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  const handleGenerate = async () => {
    const trimmedTopic = topic.trim()
    if (!trimmedTopic || !isOnline) return

    setGenerating(true)
    setError(null)

    try {
      const set = await generateSet(trimmedTopic, count)

      await db.sets.put({
        id: set.id,
        title: set.title,
        topic: set.topic,
        cardCount: set.card_count,
        createdAt: set.created_at,
      })

      await db.cards.bulkPut(
        set.cards.map((c) => ({
          id: c.id,
          setId: c.set_id,
          irish: c.irish,
          english: c.english,
          pronunciation: c.pronunciation,
          exampleSentence: c.example_sentence,
          timesCorrect: 0,
          timesIncorrect: 0,
        })),
      )

      navigate('/')
    } catch {
      setError('Generation failed — please try again.')
      setGenerating(false)
    }
  }

  const canGenerate = isOnline && topic.trim().length > 0 && !generating

  return (
    <div className="px-4 pt-8 pb-8">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Request New Set</h1>

      <div className="flex flex-col gap-5">
        {/* Topic input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="topic">
            Topic
          </label>
          <input
            ref={inputRef}
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && canGenerate && handleGenerate()}
            placeholder="e.g. An Aimsir, Ag an mBeár, An Teaghlach"
            maxLength={60}
            disabled={generating}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50"
          />
        </div>

        {/* Card count stepper */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Number of cards
          </label>
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3">
            <button
              onClick={() => setCount((c) => Math.max(MIN_CARDS, c - STEP))}
              disabled={count <= MIN_CARDS || generating}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center disabled:opacity-40 active:bg-slate-200 transition-colors"
              aria-label="Decrease card count"
            >
              <Minus size={16} />
            </button>
            <span className="flex-1 text-center text-2xl font-bold text-slate-900">
              {count}
            </span>
            <button
              onClick={() => setCount((c) => Math.min(MAX_CARDS, c + STEP))}
              disabled={count >= MAX_CARDS || generating}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center disabled:opacity-40 active:bg-slate-200 transition-colors"
              aria-label="Increase card count"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Generate button / progress */}
        {generating ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="animate-indeterminate" />
            </div>
            <p className="text-sm text-slate-500 text-center">
              ✨ Generating your set… this may take a minute.
            </p>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={18} />
            Generate Set
          </button>
        )}

        {/* Offline notice */}
        {!isOnline && !generating && (
          <p className="text-sm text-amber-600 text-center">
            ⚠️ Server not running — start Docker to generate
          </p>
        )}

        {/* Error */}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>
    </div>
  )
}
