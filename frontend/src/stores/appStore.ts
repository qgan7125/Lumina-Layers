import { create } from 'zustand'

interface AppStore {
  lang: 'zh' | 'en'
  isDark: boolean
  setLang: (lang: 'zh' | 'en') => void
  toggleTheme: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  lang: (localStorage.getItem('lang') as 'zh' | 'en') ?? 'zh',
  isDark: localStorage.getItem('theme') === 'dark',

  setLang: (lang) => {
    localStorage.setItem('lang', lang)
    set({ lang })
  },

  toggleTheme: () =>
    set((state) => {
      const next = !state.isDark
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return { isDark: next }
    }),
}))
