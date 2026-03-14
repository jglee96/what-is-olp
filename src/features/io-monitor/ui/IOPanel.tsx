import { useState } from 'react'

interface DigitalInput {
  id: string
  label: string
  value: boolean
}

interface DigitalOutput {
  id: string
  label: string
}

const DIGITAL_INPUTS: DigitalInput[] = [
  { id: 'DI_01', label: '안전문 닫힘',  value: true  },
  { id: 'DI_02', label: '비상정지',     value: false },
  { id: 'DI_03', label: '파트 감지',    value: true  },
  { id: 'DI_04', label: '컨베이어 준비', value: true  },
]

const DIGITAL_OUTPUTS: DigitalOutput[] = [
  { id: 'DO_01', label: '그리퍼 열기/닫기' },
  { id: 'DO_02', label: '진공 흡착'       },
  { id: 'DO_03', label: '상태 LED'        },
  { id: 'DO_04', label: '완료 신호'       },
]

const ROBOT_STATUS = [
  { label: '동작 모드',       value: 'AUTO',        color: '#00cc66' },
  { label: '속도 오버라이드', value: '100%',        color: '#4a90d9' },
  { label: '에러 상태',       value: 'NONE',        color: '#00cc66' },
  { label: '프로그램',        value: 'MainProgram', color: '#ff9500' },
] as const

type OutputState = Record<string, boolean>

export function IOPanel() {
  const [outputs, setOutputs] = useState<OutputState>(
    () => Object.fromEntries(DIGITAL_OUTPUTS.map((o) => [o.id, false]))
  )

  const toggle = (id: string) =>
    setOutputs((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 디지털 입력 */}
      <section>
        <div style={sectionLabel}>DIGITAL INPUT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {DIGITAL_INPUTS.map((inp) => (
            <div key={inp.id} style={rowStyle}>
              <Led on={inp.value} color="#00cc66" />
              <span style={idStyle}>{inp.id}</span>
              <span style={{ fontSize: 12, color: inp.value ? '#e6edf3' : '#484f58', flex: 1 }}>{inp.label}</span>
              <span style={{ fontSize: 10, color: inp.value ? '#00cc66' : '#484f58' }}>{inp.value ? 'ON' : 'OFF'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 디지털 출력 */}
      <section>
        <div style={sectionLabel}>DIGITAL OUTPUT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {DIGITAL_OUTPUTS.map((out) => {
            const on = outputs[out.id]
            return (
              <div key={out.id} style={{ ...rowStyle, border: `1px solid ${on ? '#4a90d940' : '#21262d'}` }}>
                <Led on={on} color="#4a90d9" />
                <span style={idStyle}>{out.id}</span>
                <span style={{ fontSize: 12, color: '#e6edf3', flex: 1 }}>{out.label}</span>
                <button
                  onClick={() => toggle(out.id)}
                  style={{
                    padding: '3px 10px',
                    background: on ? '#1f4068' : '#21262d',
                    border: `1px solid ${on ? '#4a90d9' : '#30363d'}`,
                    color: on ? '#4a90d9' : '#8b949e',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: 'inherit',
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
      <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: '10px 14px' }}>
        <div style={sectionLabel}>ROBOT STATUS</div>
        {ROBOT_STATUS.map((item) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#8b949e' }}>{item.label}</span>
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
      width: 10, height: 10, borderRadius: '50%',
      background: on ? color : '#484f58',
      boxShadow: on ? `0 0 6px ${color}` : 'none',
      flexShrink: 0,
    }} />
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  color: '#8b949e',
  marginBottom: 8,
  fontWeight: 700,
  letterSpacing: '0.05em',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px',
  background: '#161b22',
  borderRadius: 6,
  border: '1px solid #21262d',
}

const idStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#8b949e',
  width: 50,
  fontFamily: 'monospace',
}
