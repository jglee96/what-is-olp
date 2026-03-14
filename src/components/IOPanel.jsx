import { useState } from 'react'

const DIGITAL_INPUTS = [
  { id: 'DI_01', label: '안전문 닫힘', value: true },
  { id: 'DI_02', label: '비상정지', value: false },
  { id: 'DI_03', label: '파트 감지', value: true },
  { id: 'DI_04', label: '컨베이어 준비', value: true },
]

const DIGITAL_OUTPUTS = [
  { id: 'DO_01', label: '그리퍼 열기/닫기' },
  { id: 'DO_02', label: '진공 흡착' },
  { id: 'DO_03', label: '상태 LED' },
  { id: 'DO_04', label: '완료 신호' },
]

export default function IOPanel() {
  const [inputs] = useState(DIGITAL_INPUTS)
  const [outputs, setOutputs] = useState(
    DIGITAL_OUTPUTS.reduce((acc, o) => ({ ...acc, [o.id]: false }), {})
  )

  const toggle = (id) => setOutputs(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Digital Inputs */}
      <div>
        <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8, fontWeight: 700, letterSpacing: '0.05em' }}>
          DIGITAL INPUT
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {inputs.map(inp => (
            <div key={inp.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: '#161b22',
              borderRadius: 6,
              border: '1px solid #21262d',
            }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: inp.value ? '#00cc66' : '#484f58',
                boxShadow: inp.value ? '0 0 6px #00cc66' : 'none',
              }} />
              <span style={{ fontSize: 11, color: '#8b949e', width: 50, fontFamily: 'monospace' }}>{inp.id}</span>
              <span style={{ fontSize: 12, color: inp.value ? '#e6edf3' : '#484f58', flex: 1 }}>{inp.label}</span>
              <span style={{ fontSize: 10, color: inp.value ? '#00cc66' : '#484f58' }}>
                {inp.value ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Outputs */}
      <div>
        <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8, fontWeight: 700, letterSpacing: '0.05em' }}>
          DIGITAL OUTPUT
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {DIGITAL_OUTPUTS.map(out => (
            <div key={out.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: '#161b22',
              borderRadius: 6,
              border: `1px solid ${outputs[out.id] ? '#4a90d940' : '#21262d'}`,
            }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: outputs[out.id] ? '#4a90d9' : '#484f58',
                boxShadow: outputs[out.id] ? '0 0 6px #4a90d9' : 'none',
              }} />
              <span style={{ fontSize: 11, color: '#8b949e', width: 50, fontFamily: 'monospace' }}>{out.id}</span>
              <span style={{ fontSize: 12, color: '#e6edf3', flex: 1 }}>{out.label}</span>
              <button
                onClick={() => toggle(out.id)}
                style={{
                  padding: '3px 10px',
                  background: outputs[out.id] ? '#1f4068' : '#21262d',
                  border: `1px solid ${outputs[out.id] ? '#4a90d9' : '#30363d'}`,
                  color: outputs[out.id] ? '#4a90d9' : '#8b949e',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'inherit',
                }}
              >
                {outputs[out.id] ? 'ON' : 'OFF'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 로봇 상태 */}
      <div style={{
        background: '#0d1117',
        border: '1px solid #21262d',
        borderRadius: 8,
        padding: '10px 14px',
      }}>
        <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8, fontWeight: 700, letterSpacing: '0.05em' }}>
          ROBOT STATUS
        </div>
        {[
          { label: '동작 모드', value: 'AUTO', color: '#00cc66' },
          { label: '속도 오버라이드', value: '100%', color: '#4a90d9' },
          { label: '에러 상태', value: 'NONE', color: '#00cc66' },
          { label: '프로그램', value: 'MainProgram', color: '#ff9500' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#8b949e' }}>{item.label}</span>
            <span style={{ fontSize: 11, color: item.color, fontWeight: 700, fontFamily: 'monospace' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
