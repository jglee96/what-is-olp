import { useRobotStore } from '../store/robotStore'

const JOINT_NAMES = ['J1 베이스', 'J2 숄더', 'J3 엘보우', 'J4 손목롤', 'J5 손목피치', 'J6 손목요']
const JOINT_COLORS = ['#4a90d9', '#357abd', '#2a6099', '#1e4d7a', '#ff6b35', '#ff9500']

export default function JointPanel() {
  const joints = useRobotStore(s => s.joints)
  const jointLimits = useRobotStore(s => s.jointLimits)
  const setJoint = useRobotStore(s => s.setJoint)
  const resetJoints = useRobotStore(s => s.resetJoints)
  const addWaypoint = useRobotStore(s => s.addWaypoint)
  const tcpPosition = useRobotStore(s => s.tcpPosition)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* TCP 위치 표시 */}
      <div style={{
        background: '#0d1117',
        border: '1px solid #21262d',
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em' }}>
          TCP POSITION
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['x', 'y', 'z'].map(axis => (
            <div key={axis} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#8b949e' }}>{axis.toUpperCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#00ff88', fontVariantNumeric: 'tabular-nums' }}>
                {tcpPosition[axis]}m
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 관절 슬라이더 */}
      {JOINT_NAMES.map((name, i) => {
        const { min, max } = jointLimits[i]
        const pct = ((joints[i] - min) / (max - min)) * 100
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: JOINT_COLORS[i], fontWeight: 600 }}>{name}</span>
              <span style={{ fontSize: 12, color: '#e6edf3', fontVariantNumeric: 'tabular-nums' }}>
                {joints[i].toFixed(1)}°
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="range"
                min={min}
                max={max}
                step={0.5}
                value={joints[i]}
                onChange={e => setJoint(i, parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: 4,
                  appearance: 'none',
                  background: `linear-gradient(to right, ${JOINT_COLORS[i]} ${pct}%, #21262d ${pct}%)`,
                  borderRadius: 2,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 10, color: '#484f58' }}>{min}°</span>
              <span style={{ fontSize: 10, color: '#484f58' }}>{max}°</span>
            </div>
          </div>
        )
      })}

      {/* 버튼 */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={resetJoints} style={btnStyle('#21262d', '#8b949e')}>
          홈 위치
        </button>
        <button onClick={addWaypoint} style={btnStyle('#1f4068', '#4a90d9')}>
          + 경로 추가
        </button>
      </div>
    </div>
  )
}

function btnStyle(bg, color) {
  return {
    flex: 1,
    padding: '8px 12px',
    background: bg,
    border: `1px solid ${color}40`,
    color,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'inherit',
    fontWeight: 600,
  }
}
