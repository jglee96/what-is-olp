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
  joints: number[]
  jointLimits: JointLimit[]
  waypoints: Waypoint[]
  isPlaying: boolean
  playIndex: number
  playIntervalId: ReturnType<typeof setInterval> | null
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
  setActiveTab: (tab: RobotState['activeTab']) => void
  setTcpPosition: (pos: TcpPosition) => void
}

export type RobotStore = RobotState & RobotActions
