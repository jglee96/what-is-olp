import { useRobotStore } from '@entities/robot'
import type { Waypoint } from '@entities/robot'

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
      {/* 코드 헤더 */}
      <div style={cardStyle}>
        <div style={{ color: '#79c0ff', fontSize: 11, fontFamily: 'monospace' }}>MODULE MainProgram</div>
        <div style={{ color: '#a5d6ff', fontSize: 11, fontFamily: 'monospace', paddingLeft: 16 }}>
          VAR robtarget pTarget;
        </div>
      </div>

      {/* 웨이포인트 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {waypoints.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#484f58', fontSize: 12, padding: '24px 0' }}>
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
        <div style={{ ...cardStyle, maxHeight: 100, overflowY: 'auto', fontSize: 10, fontFamily: 'monospace', color: '#8b949e' }}>
          {waypoints.map((wp) => (
            <div key={wp.id} style={{ color: '#a5d6ff' }}>
              MoveJ [{wp.joints.map((j) => j.toFixed(1)).join(', ')}], v100, z5, tool0;
            </div>
          ))}
        </div>
      )}

      {/* 제어 버튼 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={addWaypoint} style={btnStyle('#1f4068', '#4a90d9')}>+ 추가</button>
        {isPlaying ? (
          <button onClick={stopPlayback} style={btnStyle('#3d1f1f', '#ff4444')}>■ 정지</button>
        ) : (
          <button
            onClick={startPlayback}
            disabled={waypoints.length < 2}
            style={btnStyle(waypoints.length < 2 ? '#1a1f26' : '#1a3a1a', waypoints.length < 2 ? '#484f58' : '#00cc66')}
          >
            ▶ 실행
          </button>
        )}
        <button onClick={clearWaypoints} style={btnStyle('#21262d', '#8b949e')}>초기화</button>
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
      background: isActive ? '#1f4068' : '#161b22',
      border: `1px solid ${isActive ? '#4a90d9' : '#21262d'}`,
      borderRadius: 6,
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      transition: 'all 0.2s',
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: '#21262d', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 11, color: '#4a90d9',
        fontWeight: 700, flexShrink: 0,
      }}>
        {index + 1}
      </div>
      <div style={{ flex: 1, fontSize: 11, fontFamily: 'monospace' }}>
        <div style={{ color: '#79c0ff' }}>MoveJ</div>
        <div style={{ color: '#8b949e', fontSize: 10 }}>
          [{waypoint.joints.map((j) => j.toFixed(0)).join(', ')}]
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onGoto(waypoint)} style={iconBtn('#2a4060', '#4a90d9')} title="이 위치로 이동">▶</button>
        <button onClick={() => onRemove(waypoint.id)} style={iconBtn('#3d1f1f', '#ff4444')} title="삭제">✕</button>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#0d1117',
  border: '1px solid #21262d',
  borderRadius: 8,
  padding: '10px 14px',
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return { flex: 1, padding: '8px 0', background: bg, border: `1px solid ${color}40`, color, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600 }
}

function iconBtn(bg: string, color: string): React.CSSProperties {
  return { width: 24, height: 24, background: bg, border: `1px solid ${color}40`, color, borderRadius: 4, cursor: 'pointer', fontSize: 10, fontFamily: 'inherit' }
}
