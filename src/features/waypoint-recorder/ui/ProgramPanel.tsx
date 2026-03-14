import { useRobotStore } from '@entities/robot'
import type { Waypoint } from '@entities/robot'

const card: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 14px',
}

// rendering-hoist-jsx: 상태·props에 의존하지 않는 정적 JSX를 모듈 레벨로 끌어올림
const RAPID_HEADER = (
  <div style={card}>
    <div style={{ color: '#79c0ff', fontSize: 11, fontFamily: 'monospace' }}>MODULE MainProgram</div>
    <div style={{ color: '#a5d6ff', fontSize: 11, fontFamily: 'monospace', paddingLeft: 16 }}>
      VAR robtarget pTarget;
    </div>
  </div>
)

export function ProgramPanel() {
  const waypoints = useRobotStore((s) => s.waypoints)
  const isPlaying = useRobotStore((s) => s.isPlaying)
  const playIndex = useRobotStore((s) => s.playIndex)
  const addWaypoint = useRobotStore((s) => s.addWaypoint)
  const removeWaypoint = useRobotStore((s) => s.removeWaypoint)
  const clearWaypoints = useRobotStore((s) => s.clearWaypoints)
  const goToWaypoint = useRobotStore((s) => s.goToWaypoint)
  const startPlayback = useRobotStore((s) => s.startPlayback)
  const stopPlayback = useRobotStore((s) => s.stopPlayback)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      {/* 코드 헤더 — 정적 JSX, 모듈 레벨 상수 참조 */}
      {RAPID_HEADER}

      {/* 웨이포인트 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {waypoints.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '24px 0' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📍</div>
            <div>관절 패널에서 "경로 추가"를 눌러</div>
            <div>웨이포인트를 등록하세요</div>
          </div>
        ) : (
          waypoints.map((wp: Waypoint, idx: number) => (
            <WaypointItem
              key={wp.id}
              waypoint={wp}
              index={idx}
              isActive={isPlaying && playIndex === idx}
              onGoto={goToWaypoint}
              onRemove={removeWaypoint}
            />
          ))
        )}
      </div>

      {/* RAPID 코드 미리보기 */}
      {waypoints.length > 0 && (
        <div style={{
          ...card,
          maxHeight: 100,
          overflowY: 'auto',
          fontSize: 10,
          fontFamily: 'monospace',
          color: 'var(--text-secondary)',
        }}>
          {waypoints.map((wp) => (
            <div key={wp.id} style={{ color: '#a5d6ff' }}>
              MoveJ [{wp.joints.map((j) => j.toFixed(1)).join(', ')}], v100, z5, tool0;
            </div>
          ))}
        </div>
      )}

      {/* 제어 버튼 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={addWaypoint} style={btn('var(--accent-dim)', 'var(--accent)', 'var(--accent-border)')}>
          + 추가
        </button>
        {isPlaying ? (
          <button onClick={stopPlayback} style={btn('var(--danger-dim)', 'var(--danger)', 'var(--danger-dim)')}>
            ■ 정지
          </button>
        ) : (
          <button
            onClick={startPlayback}
            disabled={waypoints.length < 2}
            style={btn(
              waypoints.length < 2 ? 'var(--bg-card)' : 'var(--success-dim)',
              waypoints.length < 2 ? 'var(--text-muted)' : 'var(--success)',
              'transparent',
            )}
          >
            ▶ 실행
          </button>
        )}
        <button onClick={clearWaypoints} style={btn('var(--bg-tertiary)', 'var(--text-secondary)', 'var(--border)')}>
          초기화
        </button>
      </div>
    </div>
  )
}

interface WaypointItemProps {
  waypoint: Waypoint
  index: number
  isActive: boolean
  onGoto: (wp: Waypoint) => void
  onRemove: (id: number) => void
}

function WaypointItem({ waypoint, index, isActive, onGoto, onRemove }: WaypointItemProps) {
  return (
    <div style={{
      background: isActive ? 'var(--accent-dim)' : 'var(--bg-primary)',
      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 6,
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      transition: 'background 0.2s, border-color 0.2s',
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: 'var(--bg-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: 'var(--accent)', fontWeight: 700, flexShrink: 0,
      }}>
        {index + 1}
      </div>
      <div style={{ flex: 1, fontSize: 11, fontFamily: 'monospace' }}>
        <div style={{ color: '#79c0ff' }}>MoveJ</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 10 }}>
          [{waypoint.joints.map((j) => j.toFixed(0)).join(', ')}]
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onGoto(waypoint)} style={iconBtn('var(--accent-dim)', 'var(--accent)')} title="이 위치로 이동">▶</button>
        <button onClick={() => onRemove(waypoint.id)} style={iconBtn('var(--danger-dim)', 'var(--danger)')} title="삭제">✕</button>
      </div>
    </div>
  )
}

function btn(bg: string, color: string, border: string): React.CSSProperties {
  return { flex: 1, padding: '8px 0', background: bg, border: `1px solid ${border}`, color, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600 }
}

function iconBtn(bg: string, color: string): React.CSSProperties {
  return { width: 24, height: 24, background: bg, border: `1px solid ${color}40`, color, borderRadius: 4, cursor: 'pointer', fontSize: 10, fontFamily: 'inherit' }
}
