import { useCallback, useRef, useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { Check, X } from 'lucide-react'
import FlashCard from './FlashCard'
import type { Card } from '../db'
import type { CardFace } from '../hooks/useSettings'

export interface CardResult {
  cardId: string
  correct: boolean
}

interface Props {
  cards: Card[]
  cardFace: CardFace
  onComplete: (results: CardResult[]) => void
  onProgress: (current: number) => void
}

const DRAG_THRESHOLD = 80

export default function CardStack({ cards, cardFace, onComplete, onProgress }: Props) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)

  const resultsRef = useRef<CardResult[]>([])

  const [spring, api] = useSpring(() => ({ x: 0, rotate: 0 }))

  const advance = useCallback(
    (correct: boolean) => {
      if (index >= cards.length) return

      const card = cards[index]
      resultsRef.current = [...resultsRef.current, { cardId: card.id, correct }]
      const snapshot = resultsRef.current
      const nextIndex = index + 1

      setHintVisible(false)

      api.start({
        x: correct ? window.innerWidth * 1.5 : -window.innerWidth * 1.5,
        rotate: correct ? 18 : -18,
        config: { tension: 220, friction: 22 },
        onRest: () => {
          if (nextIndex >= cards.length) {
            onComplete(snapshot)
          } else {
            setIndex(nextIndex)
            setIsFlipped(false)
            onProgress(nextIndex)
            api.set({ x: 0, rotate: 0 })
          }
        },
      })
    },
    [index, cards, api, onComplete, onProgress],
  )

  // isFlipped ref so the drag closure always sees the current value
  const isFlippedRef = useRef(false)
  isFlippedRef.current = isFlipped

  const bind = useDrag(
    ({ active, movement: [mx], direction: [dx], velocity: [vx], tap }) => {
      // Tap = flip the card
      if (tap) {
        setIsFlipped((f) => !f)
        return
      }

      if (active) {
        api.start({ x: mx, rotate: mx / 20, immediate: true })
      } else {
        const triggered = Math.abs(mx) > DRAG_THRESHOLD || vx > 0.5
        if (triggered) {
          advance(dx > 0) // right = correct, left = incorrect
        } else {
          api.start({ x: 0, rotate: 0, config: { tension: 300, friction: 30 } })
        }
      }
    },
    { filterTaps: true, axis: 'x' },
  )

  if (index >= cards.length) return null

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Card with drag binding and swipe feedback overlays */}
      <div className="relative">
        <animated.div
          {...bind()}
          style={{ x: spring.x, rotate: spring.rotate, touchAction: 'none' }}
          className="relative cursor-grab active:cursor-grabbing"
        >
          {/* Red overlay — left swipe (incorrect) */}
          <animated.div
            className="absolute inset-0 rounded-2xl bg-red-500/25 z-10 pointer-events-none flex items-center justify-center"
            style={{
              opacity: spring.x.to((x) => (x < 0 ? Math.min(-x / DRAG_THRESHOLD, 1) : 0)),
            }}
          >
            <X size={64} className="text-red-500 drop-shadow" strokeWidth={2.5} />
          </animated.div>

          {/* Green overlay — right swipe (correct) */}
          <animated.div
            className="absolute inset-0 rounded-2xl bg-green-500/25 z-10 pointer-events-none flex items-center justify-center"
            style={{
              opacity: spring.x.to((x) => (x > 0 ? Math.min(x / DRAG_THRESHOLD, 1) : 0)),
            }}
          >
            <Check size={64} className="text-green-600 drop-shadow" strokeWidth={2.5} />
          </animated.div>

          <FlashCard
            key={index}
            card={cards[index]}
            cardFace={cardFace}
            isFlipped={isFlipped}
          />
        </animated.div>
      </div>

      {/* Tap buttons — appear after flip */}
      {isFlipped ? (
        <div className="flex gap-4">
          <button
            onClick={() => advance(false)}
            className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-red-400 text-red-500 font-medium text-sm min-w-[120px] justify-center"
          >
            <X size={16} strokeWidth={2.5} />
            Incorrect
          </button>
          <button
            onClick={() => advance(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-green-500 text-green-600 font-medium text-sm min-w-[120px] justify-center"
          >
            <Check size={16} strokeWidth={2.5} />
            Correct
          </button>
        </div>
      ) : (
        <div
          className={`text-sm text-slate-400 transition-opacity duration-300 ${
            hintVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Tap the card to reveal
        </div>
      )}

      {/* Swipe direction hint */}
      {isFlipped && hintVisible && (
        <p className="text-xs text-slate-400 text-center">
          ← swipe left: incorrect &nbsp;·&nbsp; swipe right: correct →
        </p>
      )}
    </div>
  )
}
