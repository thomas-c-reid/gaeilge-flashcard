import Dexie, { type Table } from 'dexie'

export interface FlashcardSet {
  id: string
  title: string
  topic: string
  cardCount: number
  createdAt: string
}

export interface Card {
  id: string
  setId: string
  irish: string
  english: string
  pronunciation: string
  exampleSentence: string
  timesCorrect: number
  timesIncorrect: number
}

class GaeilgeDB extends Dexie {
  sets!: Table<FlashcardSet>
  cards!: Table<Card>

  constructor() {
    super('gaeilge-flashcards')
    this.version(1).stores({
      sets: 'id, createdAt',
      cards: 'id, setId',
    })
  }
}

export const db = new GaeilgeDB()
