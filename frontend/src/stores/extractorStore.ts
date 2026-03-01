import { create } from 'zustand'

interface ExtractorStore {
  sessionId: string | null
  imageUrl: string | null
  cornerPoints: [number, number][]
  extractJobId: string | null
  setSessionId: (id: string | null) => void
  setImageUrl: (url: string | null) => void
  addCornerPoint: (pt: [number, number]) => void
  clearCornerPoints: () => void
  setExtractJobId: (id: string | null) => void
  reset: () => void
}

export const useExtractorStore = create<ExtractorStore>((set) => ({
  sessionId: null,
  imageUrl: null,
  cornerPoints: [],
  extractJobId: null,

  setSessionId: (id) => set({ sessionId: id }),
  setImageUrl: (url) => set({ imageUrl: url }),

  addCornerPoint: (pt) =>
    set((state) => ({
      cornerPoints:
        state.cornerPoints.length < 4 ? [...state.cornerPoints, pt] : state.cornerPoints,
    })),

  clearCornerPoints: () => set({ cornerPoints: [] }),

  setExtractJobId: (id) => set({ extractJobId: id }),

  reset: () => set({ sessionId: null, imageUrl: null, cornerPoints: [], extractJobId: null }),
}))
