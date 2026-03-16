import { useSpring, animated } from '@react-spring/web'
import type { Card } from '../db'
import type { CardFace } from '../hooks/useSettings'

interface Props {
  card: Card
  cardFace: CardFace
  isFlipped: boolean
}

export default function FlashCard({ card, cardFace, isFlipped }: Props) {
  const { rotation } = useSpring({
    rotation: isFlipped ? 180 : 0,
    config: { tension: 280, friction: 32 },
  })

  const frontWord = cardFace === 'irish' ? card.irish : card.english
  const backWord = cardFace === 'irish' ? card.english : card.irish
  const frontLang = cardFace === 'irish' ? 'Gaeilge' : 'English'
  const backLang = cardFace === 'irish' ? 'English' : 'Gaeilge'
  const frontIsIrish = cardFace === 'irish'
  const backIsIrish = cardFace === 'english'

  return (
    <div
      className="relative w-[85vw] max-w-sm no-select cursor-pointer"
      style={{ perspective: '1200px', height: 'min(70vh, 420px)' }}
    >
      {/* Front face */}
      <animated.div
        className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl px-6 py-8"
        style={{
          transform: rotation.to((r) => `rotateY(${r}deg)`),
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-5">
          {frontLang}
        </p>
        <p
          className={`text-4xl font-bold text-center text-slate-900 leading-tight ${
            frontIsIrish ? 'font-serif' : ''
          }`}
        >
          {frontWord}
        </p>
        {!isFlipped && (
          <p className="mt-8 text-sm text-slate-400 select-none">tap to reveal</p>
        )}
      </animated.div>

      {/* Back face */}
      <animated.div
        className="absolute inset-0 flex flex-col justify-center bg-primary-light rounded-2xl shadow-xl px-6 py-8"
        style={{
          transform: rotation.to((r) => `rotateY(${r + 180}deg)`),
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-1">
          {frontLang}
        </p>
        <p
          className={`text-base text-slate-500 mb-4 ${frontIsIrish ? 'font-serif' : ''}`}
        >
          {frontWord}
        </p>

        <div className="w-10 h-px bg-slate-300 mb-4" />

        <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-1">
          {backLang}
        </p>
        <p
          className={`text-2xl font-semibold text-slate-900 mb-3 leading-snug ${
            backIsIrish ? 'font-serif' : ''
          }`}
        >
          {backWord}
        </p>

        {card.pronunciation ? (
          <p className="text-base italic text-slate-500 mb-3">/{card.pronunciation}/</p>
        ) : null}

        {card.exampleSentence ? (
          <p className="text-sm text-slate-600 italic leading-relaxed">
            &ldquo;{card.exampleSentence}&rdquo;
          </p>
        ) : null}
      </animated.div>
    </div>
  )
}
