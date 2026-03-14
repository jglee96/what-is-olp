import { useRobotStore } from '@entities/robot'
import { JointPanel } from '@features/joint-control'
import { ProgramPanel } from '@features/waypoint-recorder'
import { IOPanel } from '@features/io-monitor'
import type { RobotState } from '@entities/robot'

type Tab = RobotState['activeTab']

const TABS: { key: Tab; label: string }[] = [
  { key: 'joints',  label: '관절 제어' },
  { key: 'program', label: '프로그램'  },
  { key: 'io',      label: 'I/O'       },
]

export function ControlPanel() {
  const activeTab = useRobotStore((s) => s.activeTab)
  const setActiveTab = useRobotStore((s) => s.setActiveTab)

  return (
    <div style={{
      width: 300,
      background: '#161b22',
      borderLeft: '1px solid #21262d',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* 탭 */}
      <div style={{ display: 'flex', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
        {TABS.map((tab) => (
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

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {activeTab === 'joints'  && <JointPanel />}
        {activeTab === 'program' && <ProgramPanel />}
        {activeTab === 'io'      && <IOPanel />}
      </div>
    </div>
  )
}
