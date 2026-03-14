import { Suspense } from 'react'
import { useRobotStore } from './store/robotStore'
import Scene3D from './components/Scene3D'
import JointPanel from './components/JointPanel'
import ProgramPanel from './components/ProgramPanel'
import IOPanel from './components/IOPanel'

const TABS = [
  { key: 'joints', label: '관절 제어' },
  { key: 'program', label: '프로그램' },
  { key: 'io', label: 'I/O' },
]

export default function App() {
  const activeTab = useRobotStore(s => s.activeTab)
  const setActiveTab = useRobotStore(s => s.setActiveTab)
  const waypoints = useRobotStore(s => s.waypoints)
  const isPlaying = useRobotStore(s => s.isPlaying)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 상단 툴바 */}
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
            boxShadow: isPlaying ? '0 0 8px #00cc66' : '0 0 8px #ff9500',
          }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>
            Robot OLP Simulator
          </span>
          <span style={{ fontSize: 11, color: '#8b949e', marginLeft: 4 }}>
            6-DOF Industrial Arm
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* 상태 표시 */}
        <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
          <span style={{ color: '#8b949e' }}>
            웨이포인트: <span style={{ color: '#4a90d9', fontWeight: 700 }}>{waypoints.length}</span>
          </span>
          <span style={{ color: isPlaying ? '#00cc66' : '#8b949e', fontWeight: isPlaying ? 700 : 400 }}>
            {isPlaying ? '▶ 실행 중' : '● 대기'}
          </span>
        </div>

        {/* 브랜드 로고 영역 */}
        <div style={{ fontSize: 10, color: '#30363d', fontFamily: 'monospace' }}>
          OLP STUDIO v1.0
        </div>
      </header>

      {/* 메인 영역 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 3D 뷰포트 */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Suspense fallback={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#4a90d9',
              fontSize: 14,
            }}>
              3D 씬 로딩 중...
            </div>
          }>
            <Scene3D />
          </Suspense>

          {/* 뷰포트 레이블 */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontSize: 10,
            color: '#484f58',
            fontFamily: 'monospace',
            pointerEvents: 'none',
          }}>
            PERSPECTIVE VIEW · 드래그: 회전 · 스크롤: 줌
          </div>
        </div>

        {/* 우측 패널 */}
        <div style={{
          width: 300,
          background: '#161b22',
          borderLeft: '1px solid #21262d',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          {/* 탭 */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #21262d',
            flexShrink: 0,
          }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: activeTab === tab.key ? '#1c2128' : 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab.key ? '#4a90d9' : 'transparent'}`,
                  color: activeTab === tab.key ? '#e6edf3' : '#8b949e',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 패널 콘텐츠 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {activeTab === 'joints' && <JointPanel />}
            {activeTab === 'program' && <ProgramPanel />}
            {activeTab === 'io' && <IOPanel />}
          </div>
        </div>
      </div>

      {/* 하단 상태바 */}
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
        {[
          { label: 'ABB IRB 6700', color: '#8b949e' },
          { label: 'RAPID Language', color: '#8b949e' },
          { label: '← 관절 탭에서 슬라이더를 움직여 로봇을 조작해보세요', color: '#484f58' },
        ].map((item, i) => (
          <span key={i} style={{ fontSize: 10, color: item.color, fontFamily: 'monospace' }}>
            {item.label}
          </span>
        ))}
      </footer>
    </div>
  )
}
