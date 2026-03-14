export interface JointLimit {
  min: number
  max: number
}

export interface Waypoint {
  id: number
  name: string
  joints: number[]
}

export interface TcpPosition {
  x: string
  y: string
  z: string
}

export interface RobotState {
  joints: number[]        // 목표 관절각 (슬라이더/재생이 설정)
  jointLimits: JointLimit[]
  waypoints: Waypoint[]
  isPlaying: boolean
  playIndex: number
  tcpPosition: TcpPosition
  activeTab: 'joints' | 'program' | 'io'
}

export interface RobotActions {
  setJoint: (index: number, value: number) => void
  resetJoints: () => void
  addWaypoint: () => void
  removeWaypoint: (id: number) => void
  clearWaypoints: () => void
  goToWaypoint: (waypoint: Waypoint) => void
  startPlayback: () => void
  stopPlayback: () => void
  advancePlayback: () => void  // useFrame에서 호출
  setActiveTab: (tab: RobotState['activeTab']) => void
  setTcpPosition: (pos: TcpPosition) => void
}

export type RobotStore = RobotState & RobotActions
