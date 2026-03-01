import { create } from 'zustand'

interface ConverterStore {
  sessionId: string | null
  previewJobId: string | null
  generate3mfJobId: string | null
  replacementMap: Record<string, string>
  setSessionId: (id: string | null) => void
  setPreviewJobId: (id: string | null) => void
  setGenerate3mfJobId: (id: string | null) => void
  addReplacement: (from: string, to: string) => void
  removeReplacement: (from: string) => void
  clearReplacements: () => void
  reset: () => void
}

export const useConverterStore = create<ConverterStore>((set) => ({
  sessionId: null,
  previewJobId: null,
  generate3mfJobId: null,
  replacementMap: {},

  setSessionId: (id) => set({ sessionId: id }),
  setPreviewJobId: (id) => set({ previewJobId: id }),
  setGenerate3mfJobId: (id) => set({ generate3mfJobId: id }),

  addReplacement: (from, to) =>
    set((state) => ({ replacementMap: { ...state.replacementMap, [from]: to } })),

  removeReplacement: (from) =>
    set((state) => {
      const next = { ...state.replacementMap }
      delete next[from]
      return { replacementMap: next }
    }),

  clearReplacements: () => set({ replacementMap: {} }),

  reset: () =>
    set({ sessionId: null, previewJobId: null, generate3mfJobId: null, replacementMap: {} }),
}))
