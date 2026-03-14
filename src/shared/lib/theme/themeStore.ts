import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

interface ThemeStore {
  mode: ThemeMode
  resolved: ResolvedTheme
  setMode: (mode: ThemeMode) => void
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolve(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? getSystemTheme() : mode
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'system',
      resolved: resolve('system'),

      setMode: (mode) => {
        const resolved = resolve(mode)
        set({ mode, resolved })
        document.documentElement.setAttribute('data-theme', resolved)
      },
    }),
    { name: 'olp-theme' }
  )
)

// 초기 data-theme 적용 + 시스템 변경 감지
export function initTheme() {
  const { mode, setMode } = useThemeStore.getState()
  setMode(mode)

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', () => {
    const { mode } = useThemeStore.getState()
    if (mode === 'system') setMode('system')
  })
}
