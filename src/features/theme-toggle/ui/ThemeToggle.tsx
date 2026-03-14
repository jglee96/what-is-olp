import { useThemeStore } from '@shared/lib/theme'
import type { ThemeMode } from '@shared/lib/theme'

const OPTIONS: { mode: ThemeMode; icon: string; label: string }[] = [
  { mode: 'light',  icon: '☀',  label: '라이트' },
  { mode: 'system', icon: '⬤', label: '시스템' },
  { mode: 'dark',   icon: '☾',  label: '다크'   },
]

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 2,
      gap: 2,
    }}>
      {OPTIONS.map((opt) => {
        const active = mode === opt.mode
        return (
          <button
            key={opt.mode}
            onClick={() => setMode(opt.mode)}
            title={opt.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              background: active ? 'var(--accent-dim)' : 'transparent',
              border: `1px solid ${active ? 'var(--accent-border)' : 'transparent'}`,
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 10 }}>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
