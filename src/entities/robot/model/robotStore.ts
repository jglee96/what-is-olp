import { create } from 'zustand'
import type { JointLimit, RobotStore, TcpPosition, Waypoint } from './types'

const JOINT_LIMITS: JointLimit[] = [
  { min: -170, max: 170 },
  { min: -90,  max: 90  },
  { min: -70,  max: 135 },
  { min: -185, max: 185 },
  { min: -120, max: 120 },
  { min: -350, max: 350 },
]

const DEFAULT_JOINTS: number[] = [0, 20, -30, 0, 0, 0]

export const useRobotStore = create<RobotStore>((set, get) => ({
  joints: [...DEFAULT_JOINTS],
  jointLimits: JOINT_LIMITS,
  waypoints: [],
  isPlaying: false,
  playIndex: 0,
  tcpPosition: { x: '0.000', y: '0.000', z: '0.000' },
  activeTab: 'joints',

  setJoint: (index, value) => {
    const joints = [...get().joints]
    joints[index] = value
    set({ joints })
  },

  resetJoints: () => set({ joints: [...DEFAULT_JOINTS] }),

  addWaypoint: () => {
    const { joints, waypoints } = get()
    const wp: Waypoint = {
      id: Date.now(),
      name: `P${waypoints.length + 1}`,
      joints: [...joints],
    }
    set({ waypoints: [...waypoints, wp] })
  },

  removeWaypoint: (id) =>
    set({ waypoints: get().waypoints.filter((w) => w.id !== id) }),

  clearWaypoints: () => set({ waypoints: [] }),

  goToWaypoint: (wp) => set({ joints: [...wp.joints] }),

  // 재생 시작: playIndex=0 에 해당하는 joints 설정 → useFrame이 lerp 시작
  startPlayback: () => {
    const { waypoints } = get()
    if (waypoints.length < 2) return
    set({
      isPlaying: true,
      playIndex: 0,
      joints: [...waypoints[0].joints],
    })
  },

  stopPlayback: () => set({ isPlaying: false }),

  // RobotArm의 useFrame이 목표 도달 시 호출
  advancePlayback: () => {
    const { playIndex, waypoints } = get()
    const next = playIndex + 1
    if (next >= waypoints.length) {
      set({ isPlaying: false })
      return
    }
    set({ playIndex: next, joints: [...waypoints[next].joints] })
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setTcpPosition: (pos: TcpPosition) => set({ tcpPosition: pos }),
}))
