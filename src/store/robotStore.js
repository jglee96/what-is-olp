import { create } from 'zustand'

// 6-DOF 산업용 로봇 관절 한계 (도 단위)
const JOINT_LIMITS = [
  { min: -170, max: 170 }, // J1: 베이스 회전
  { min: -90,  max: 90  }, // J2: 숄더
  { min: -70,  max: 135  }, // J3: 엘보우
  { min: -185, max: 185 }, // J4: 손목 롤
  { min: -120, max: 120 }, // J5: 손목 피치
  { min: -350, max: 350 }, // J6: 손목 요
]

const DEFAULT_JOINTS = [0, 20, -30, 0, 0, 0]

export const useRobotStore = create((set, get) => ({
  // 관절 각도 (degrees)
  joints: [...DEFAULT_JOINTS],
  jointLimits: JOINT_LIMITS,

  // 기록된 경로 포인트들
  waypoints: [],
  isPlaying: false,
  playIndex: 0,
  playIntervalId: null,

  // TCP 위치 (forward kinematics로 계산)
  tcpPosition: { x: 0, y: 0, z: 0 },

  // 선택된 탭
  activeTab: 'joints', // 'joints' | 'program' | 'io'

  setJoint: (index, value) => {
    const joints = [...get().joints]
    joints[index] = value
    set({ joints })
  },

  resetJoints: () => set({ joints: [...DEFAULT_JOINTS] }),

  addWaypoint: () => {
    const { joints, waypoints } = get()
    const newWaypoint = {
      id: Date.now(),
      name: `P${waypoints.length + 1}`,
      joints: [...joints],
    }
    set({ waypoints: [...waypoints, newWaypoint] })
  },

  removeWaypoint: (id) => {
    set({ waypoints: get().waypoints.filter(w => w.id !== id) })
  },

  clearWaypoints: () => set({ waypoints: [] }),

  goToWaypoint: (waypoint) => {
    set({ joints: [...waypoint.joints] })
  },

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

  setTcpPosition: (pos) => set({ tcpPosition: pos }),
}))
