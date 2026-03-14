import { useRobotStore } from '../store/robotStore'

export default function ProgramPanel() {
  const waypoints = useRobotStore(s => s.waypoints)
  const isPlaying = useRobotStore(s => s.isPlaying)
  const playIndex = useRobotStore(s => s.playIndex)
  const removeWaypoint = useRobotStore(s => s.removeWaypoint)
  const goToWaypoint = useRobotStore(s => s.goToWaypoint)
  const clearWaypoints = useRobotStore(s => s.clearWaypoints)
  const startPlayback = useRobotStore(s => s.startPlayback)
  const stopPlayback = useRobotStore(s => s.stopPlayback)
  const addWaypoint = useRobotStore(s => s.addWaypoint)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      {/* 코드 헤더 */}
      <div style={{
        background: '#0d1117',
        border: '1px solid #21262d',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 11,
        color: '#8b949e',
        fontFamily: 'monospace',
      }}>
        <div style={{ color: '#79c0ff' }}>MODULE MainProgram</div>
        <div style={{ paddingLeft: 16, color: '#a5d6ff' }}>VAR robtarget pTarget;</div>
      </div>

      {/* 경로 포인트 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {waypoints.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#484f58',
            fontSize: 12,
            padding: '24px 0',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📍</div>
            <div>관절 패널에서 "경로 추가"를 눌러</div>
            <div>웨이포인트를 등록하세요</div>
          </div>
        ) : waypoints.map((wp, idx) => (
          <div
            key={wp.id}
            style={{
              background: isPlaying && playIndex === idx ? '#1f4068' : '#161b22',
              border: `1px solid ${isPlaying && playIndex === idx ? '#4a90d9' : '#21262d'}`,
              borderRadius: 6,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            {/* 인덱스 번호 */}
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#21262d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: '#4a90d9',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {idx + 1}
            </div>

            {/* 코드 표시 */}
            <div style={{ flex: 1, fontSize: 11, fontFamily: 'monospace' }}>
              <div style={{ color: '#79c0ff' }}>MoveJ</div>
              <div style={{ color: '#8b949e', fontSize: 10 }}>
                [{wp.joints.map(j => j.toFixed(0)).join(', ')}]
              </div>
            </div>

            {/* 버튼들 */}
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => goToWaypoint(wp)}
                style={iconBtnStyle('#2a4060', '#4a90d9')}
                title="이 위치로 이동"
              >
                ▶
              </button>
              <button
                onClick={() => removeWaypoint(wp.id)}
                style={iconBtnStyle('#3d1f1f', '#ff4444')}
                title="삭제"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RAPID 코드 미리보기 */}
      {waypoints.length > 0 && (
        <div style={{
          background: '#0d1117',
          border: '1px solid #21262d',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 10,
          fontFamily: 'monospace',
          color: '#8b949e',
          maxHeight: 100,
          overflowY: 'auto',
        }}>
          {waypoints.map((wp, i) => (
            <div key={wp.id} style={{ color: '#a5d6ff' }}>
              MoveJ [{wp.joints.map(j => j.toFixed(1)).join(', ')}], v100, z5, tool0;
            </div>
          ))}
        </div>
      )}

      {/* 제어 버튼 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={addWaypoint} style={btnStyle('#1f4068', '#4a90d9')}>
          + 추가
        </button>
        {!isPlaying ? (
          <button
            onClick={startPlayback}
            disabled={waypoints.length < 2}
            style={btnStyle(waypoints.length < 2 ? '#1a1f26' : '#1a3a1a', waypoints.length < 2 ? '#484f58' : '#00cc66')}
          >
            ▶ 실행
          </button>
        ) : (
          <button onClick={stopPlayback} style={btnStyle('#3d1f1f', '#ff4444')}>
            ■ 정지
          </button>
        )}
        <button onClick={clearWaypoints} style={btnStyle('#21262d', '#8b949e')}>
          초기화
        </button>
      </div>
    </div>
  )
}

function iconBtnStyle(bg, color) {
  return {
    width: 24,
    height: 24,
    background: bg,
    border: `1px solid ${color}40`,
    color,
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
  }
}

function btnStyle(bg, color) {
  return {
    flex: 1,
    padding: '8px 0',
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
