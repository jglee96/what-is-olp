import { useRobotStore } from '@entities/robot'
import { Viewport3D } from '@widgets/viewport-3d'
import { ControlPanel } from '@widgets/control-panel'
import { ThemeToggle } from '@features/theme-toggle'

export function SimulatorPage() {
  const waypoints = useRobotStore((s) => s.waypoints)
  const isPlaying = useRobotStore((s) => s.isPlaying)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 헤더 */}
      <header style={{
        height: 50,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isPlaying ? 'var(--success)' : 'var(--warning)',
            boxShadow: `0 0 8px ${isPlaying ? 'var(--success)' : 'var(--warning)'}`,
            transition: 'background 0.3s',
          }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Robot OLP Simulator
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            6-DOF Industrial Arm
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* 테마 토글 */}
        <ThemeToggle />

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        <span style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          웨이포인트: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{waypoints.length}</span>
        </span>
        <span style={{
          fontSize: 11,
          color: isPlaying ? 'var(--success)' : 'var(--text-secondary)',
          fontWeight: isPlaying ? 700 : 400,
          whiteSpace: 'nowrap',
        }}>
          {isPlaying ? '▶ 실행 중' : '● 대기'}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          OLP STUDIO v1.0
        </span>
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
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 16,
        flexShrink: 0,
      }}>
        {[
          { text: 'ABB IRB 6700',    style: { color: 'var(--text-secondary)' } },
          { text: 'RAPID Language',  style: { color: 'var(--text-secondary)' } },
          { text: '← 관절 탭에서 슬라이더를 움직여 로봇을 조작 · 경로 추가 후 프로그램 탭에서 실행',
            style: { color: 'var(--text-muted)' } },
        ].map(({ text, style }) => (
          <span key={text} style={{ fontSize: 10, fontFamily: 'monospace', ...style }}>
            {text}
          </span>
        ))}
      </footer>
    </div>
  )
}
