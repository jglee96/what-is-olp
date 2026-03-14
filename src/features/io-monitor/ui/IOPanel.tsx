import { useState } from 'react'

interface DigitalInput  { id: string; label: string; value: boolean }
interface DigitalOutput { id: string; label: string }

const DIGITAL_INPUTS: DigitalInput[] = [
  { id: 'DI_01', label: '안전문 닫힘',   value: true  },
  { id: 'DI_02', label: '비상정지',      value: false },
  { id: 'DI_03', label: '파트 감지',     value: true  },
  { id: 'DI_04', label: '컨베이어 준비', value: true  },
]

const DIGITAL_OUTPUTS: DigitalOutput[] = [
  { id: 'DO_01', label: '그리퍼 열기/닫기' },
  { id: 'DO_02', label: '진공 흡착'        },
  { id: 'DO_03', label: '상태 LED'         },
  { id: 'DO_04', label: '완료 신호'        },
]

const ROBOT_STATUS = [
  { label: '동작 모드',       value: 'AUTO',        color: 'var(--success)'  },
  { label: '속도 오버라이드', value: '100%',        color: 'var(--accent)'   },
  { label: '에러 상태',       value: 'NONE',        color: 'var(--success)'  },
  { label: '프로그램',        value: 'MainProgram', color: 'var(--warning)'  },
] as const

type OutputState = Record<string, boolean>

export function IOPanel() {
  const [outputs, setOutputs] = useState<OutputState>(
    () => Object.fromEntries(DIGITAL_OUTPUTS.map((o) => [o.id, false]))
  )
  const toggle = (id: string) => setOutputs((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* DI */}
      <section>
        <div style={label}>DIGITAL INPUT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {DIGITAL_INPUTS.map((inp) => (
            <div key={inp.id} style={row}>
              <Led on={inp.value} color="var(--success)" />
              <span style={idStyle}>{inp.id}</span>
              <span style={{ fontSize: 12, color: inp.value ? 'var(--text-primary)' : 'var(--text-muted)', flex: 1 }}>
                {inp.label}
              </span>
              <span style={{ fontSize: 10, color: inp.value ? 'var(--success)' : 'var(--text-muted)' }}>
                {inp.value ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* DO */}
      <section>
        <div style={label}>DIGITAL OUTPUT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {DIGITAL_OUTPUTS.map((out) => {
            const on = outputs[out.id]
            return (
              <div key={out.id} style={{ ...row, border: `1px solid ${on ? 'var(--accent-border)' : 'var(--border)'}` }}>
                <Led on={on} color="var(--accent)" />
                <span style={idStyle}>{out.id}</span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)', flex: 1 }}>{out.label}</span>
                <button
                  onClick={() => toggle(out.id)}
                  style={{
                    padding: '3px 10px',
                    background: on ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                    border: `1px solid ${on ? 'var(--accent)' : 'var(--border-hover)'}`,
                    color: on ? 'var(--accent)' : 'var(--text-secondary)',
                    borderRadius: 4, cursor: 'pointer',
                    fontSize: 11, fontFamily: 'inherit',
                  }}
                >
                  {on ? 'ON' : 'OFF'}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* 로봇 상태 */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={label}>ROBOT STATUS</div>
        {ROBOT_STATUS.map((item) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</span>
            <span style={{ fontSize: 11, color: item.color, fontWeight: 700, fontFamily: 'monospace' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Led({ on, color }: { on: boolean; color: string }) {
  return (
    <div style={{
      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
      background: on ? color : 'var(--text-muted)',
      boxShadow: on ? `0 0 6px ${color}` : 'none',
      transition: 'all 0.2s',
    }} />
  )
}

const label: React.CSSProperties = {
  fontSize: 11, color: 'var(--text-secondary)',
  marginBottom: 8, fontWeight: 700, letterSpacing: '0.05em',
}

const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '6px 10px', background: 'var(--bg-primary)',
  borderRadius: 6, border: '1px solid var(--border)',
}

const idStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--text-secondary)',
  width: 50, fontFamily: 'monospace',
}
