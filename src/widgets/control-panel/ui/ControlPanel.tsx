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
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '10px 0',
                background: active ? 'var(--bg-tertiary)' : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'inherit',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {activeTab === 'joints'  && <JointPanel />}
        {activeTab === 'program' && <ProgramPanel />}
        {activeTab === 'io'      && <IOPanel />}
      </div>
    </div>
  )
}
