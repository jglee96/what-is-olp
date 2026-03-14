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
  playIntervalId: null,
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
    const newWaypoint: Waypoint = {
      id: Date.now(),
      name: `P${waypoints.length + 1}`,
      joints: [...joints],
    }
    set({ waypoints: [...waypoints, newWaypoint] })
  },

  removeWaypoint: (id) =>
    set({ waypoints: get().waypoints.filter((w) => w.id !== id) }),

  clearWaypoints: () => set({ waypoints: [] }),

  goToWaypoint: (waypoint) => set({ joints: [...waypoint.joints] }),

  startPlayback: () => {
    const { waypoints, isPlaying } = get()
    if (isPlaying || waypoints.length < 2) return

    let idx = 0
    const intervalId = setInterval(() => {
      const { waypoints } = get()
      if (idx >= waypoints.length) {
        clearInterval(intervalId)
        set({ isPlaying: false, playIntervalId: null })
        return
      }
      set({ joints: [...waypoints[idx].joints], playIndex: idx })
      idx++
    }, 800)

    set({ isPlaying: true, playIntervalId: intervalId, playIndex: 0 })
  },

  stopPlayback: () => {
    const { playIntervalId } = get()
    if (playIntervalId) clearInterval(playIntervalId)
    set({ isPlaying: false, playIntervalId: null })
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setTcpPosition: (pos: TcpPosition) => set({ tcpPosition: pos }),
}))
