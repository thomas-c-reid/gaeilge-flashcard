import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: {
    'X-API-Key': import.meta.env.VITE_API_KEY ?? '',
  },
  // Generation can take up to 90s for a large set
  timeout: 120_000,
})

export interface SetSummary {
  id: string
  title: string
  topic: string
  card_count: number
  created_at: string
}

export interface CardData {
  id: string
  set_id: string
  irish: string
  english: string
  pronunciation: string
  example_sentence: string
}

export interface SetDetail extends SetSummary {
  cards: CardData[]
}

export const getSets = (): Promise<SetSummary[]> =>
  http.get<SetSummary[]>('/sets').then((r) => r.data)

export const getSet = (id: string): Promise<SetDetail> =>
  http.get<SetDetail>(`/sets/${id}`).then((r) => r.data)

export const generateSet = (topic: string, count: number): Promise<SetDetail> =>
  http.post<SetDetail>('/generate', { topic, count }).then((r) => r.data)

export const checkHealth = (): Promise<void> =>
  http.get('/health', { timeout: 3_000 }).then(() => undefined)
