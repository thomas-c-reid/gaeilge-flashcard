import { useEffect } from 'react'
import { getSets, getSet } from '../api/client'
import { db } from '../db'

export function useSync(isOnline: boolean): void {
  useEffect(() => {
    if (!isOnline) return

    const sync = async () => {
      try {
        const sets = await getSets()

        await db.sets.bulkPut(
          sets.map((s) => ({
            id: s.id,
            title: s.title,
            topic: s.topic,
            cardCount: s.card_count,
            createdAt: s.created_at,
          })),
        )

        for (const set of sets) {
          const detail = await getSet(set.id)

          // Preserve local stats when upserting cards
          const existing = await db.cards.where('setId').equals(set.id).toArray()
          const statsById = Object.fromEntries(
            existing.map((c) => [c.id, { timesCorrect: c.timesCorrect, timesIncorrect: c.timesIncorrect }]),
          )

          await db.cards.bulkPut(
            detail.cards.map((c) => ({
              id: c.id,
              setId: c.set_id,
              irish: c.irish,
              english: c.english,
              pronunciation: c.pronunciation,
              exampleSentence: c.example_sentence,
              timesCorrect: statsById[c.id]?.timesCorrect ?? 0,
              timesIncorrect: statsById[c.id]?.timesIncorrect ?? 0,
            })),
          )
        }
      } catch {
        // Server unreachable — play from IndexedDB cache
      }
    }

    sync()
  }, [isOnline])
}
