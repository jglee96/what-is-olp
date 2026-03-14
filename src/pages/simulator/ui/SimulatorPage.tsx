import { useRobotStore } from '@entities/robot'
import { Viewport3D } from '@widgets/viewport-3d'
import { ControlPanel } from '@widgets/control-panel'

export function SimulatorPage() {
  const waypoints = useRobotStore((s) => s.waypoints)
  const isPlaying = useRobotStore((s) => s.isPlaying)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 헤더 */}
      <header style={{
        height: 48,
        background: '#161b22',
        borderBottom: '1px solid #21262d',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 16,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isPlaying ? '#00cc66' : '#ff9500',
            boxShadow: `0 0 8px ${isPlaying ? '#00cc66' : '#ff9500'}`,
          }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>Robot OLP Simulator</span>
          <span style={{ fontSize: 11, color: '#8b949e', marginLeft: 4 }}>6-DOF Industrial Arm</span>
        </div>

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: 11, color: '#8b949e' }}>
          웨이포인트: <span style={{ color: '#4a90d9', fontWeight: 700 }}>{waypoints.length}</span>
        </span>
        <span style={{ fontSize: 11, color: isPlaying ? '#00cc66' : '#8b949e', fontWeight: isPlaying ? 700 : 400 }}>
          {isPlaying ? '▶ 실행 중' : '● 대기'}
        </span>
        <span style={{ fontSize: 10, color: '#30363d', fontFamily: 'monospace' }}>OLP STUDIO v1.0</span>
      </header>

      {/* 메인 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Viewport3D />
        </div>
        <ControlPanel />
      </div>

      {/* 푸터 */}
      <footer style={{
        height: 24,
        background: '#0d1117',
        borderTop: '1px solid #21262d',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 16,
        flexShrink: 0,
      }}>
        {['ABB IRB 6700', 'RAPID Language', '← 관절 탭에서 슬라이더를 움직여 로봇을 조작해보세요'].map((text, i) => (
          <span key={i} style={{ fontSize: 10, color: i < 2 ? '#8b949e' : '#484f58', fontFamily: 'monospace' }}>
            {text}
          </span>
        ))}
      </footer>
    </div>
  )
}
