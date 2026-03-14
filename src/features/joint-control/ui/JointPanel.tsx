import { useRobotStore } from '@entities/robot'

const JOINT_NAMES = ['J1 베이스', 'J2 숄더', 'J3 엘보우', 'J4 손목롤', 'J5 손목피치', 'J6 손목요'] as const
const JOINT_COLORS = ['#4a90d9', '#357abd', '#2a6099', '#1e4d7a', '#ff6b35', '#ff9500'] as const

// rerender-memo: ~10fps로 갱신되는 TCP 표시를 별도 컴포넌트로 분리
// JointPanel(슬라이더)과 TcpDisplay(위치값)의 리렌더 사이클을 독립시킴
function TcpDisplay() {
  const tcpPosition = useRobotStore((s) => s.tcpPosition)
  return (
    <div style={card}>
      <div style={sectionLabel}>TCP POSITION</div>
      <div style={{ display: 'flex', gap: 12 }}>
        {(['x', 'y', 'z'] as const).map((axis) => (
          <div key={axis} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{axis.toUpperCase()}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tcp)', fontVariantNumeric: 'tabular-nums' }}>
              {tcpPosition[axis]}m
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function JointPanel() {
  const joints = useRobotStore((s) => s.joints)
  const jointLimits = useRobotStore((s) => s.jointLimits)
  const setJoint = useRobotStore((s) => s.setJoint)
  const resetJoints = useRobotStore((s) => s.resetJoints)
  const addWaypoint = useRobotStore((s) => s.addWaypoint)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* TCP 위치 — 별도 컴포넌트로 격리 */}
      <TcpDisplay />

      {/* 관절 슬라이더 */}
      {JOINT_NAMES.map((name, i) => {
        const { min, max } = jointLimits[i]
        const pct = ((joints[i] - min) / (max - min)) * 100
        const color = JOINT_COLORS[i]
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color, fontWeight: 600 }}>{name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {joints[i].toFixed(1)}°
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={0.5}
              value={joints[i]}
              onChange={(e) => setJoint(i, parseFloat(e.target.value))}
              style={{
                width: '100%',
                background: `linear-gradient(to right, ${color} ${pct}%, var(--border) ${pct}%)`,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{min}°</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{max}°</span>
            </div>
          </div>
        )
      })}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={resetJoints} style={btn('var(--bg-tertiary)', 'var(--text-secondary)', 'var(--border)')}>
          홈 위치
        </button>
        <button onClick={addWaypoint} style={btn('var(--accent-dim)', 'var(--accent)', 'var(--accent-border)')}>
          + 경로 추가
        </button>
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 14px',
  marginBottom: 12,
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-secondary)',
  marginBottom: 6,
  fontWeight: 600,
  letterSpacing: '0.05em',
}

function btn(bg: string, color: string, border: string): React.CSSProperties {
  return {
    flex: 1,
    padding: '8px 12px',
    background: bg,
    border: `1px solid ${border}`,
    color,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'inherit',
    fontWeight: 600,
  }
}
