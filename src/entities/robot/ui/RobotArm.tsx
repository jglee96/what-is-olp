import { useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useRobotStore } from '../model/robotStore'
import { JOINT_NAMES, JOINT_COLORS } from '../model/constants'
import { JointProtractor } from './JointProtractor'

const DEG = Math.PI / 180
const LERP_SPEED = 4
const ARRIVE_THRESHOLD = 0.005

interface LinkParams { length: number; radius: number; color: string }

const LINKS: LinkParams[] = [
  { length: 0.4,  radius: 0.08,  color: '#4a90d9' },
  { length: 0.7,  radius: 0.07,  color: '#357abd' },
  { length: 0.55, radius: 0.06,  color: '#2a6099' },
  { length: 0.12, radius: 0.055, color: '#1e4d7a' },
  { length: 0.12, radius: 0.05,  color: '#1e4d7a' },
  { length: 0.12, radius: 0.045, color: '#ff6b35' },
]

interface JointHandlers {
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void
  onPointerMove: (e: ThreeEvent<PointerEvent>) => void
  onPointerUp:   (e: ThreeEvent<PointerEvent>) => void
}

function Joint({
  radius = 0.1,
  color = '#888',
  isSelected,
  handlers,
}: {
  radius?: number
  color?: string
  isSelected?: boolean
  handlers?: JointHandlers
}) {
  return (
    <mesh {...handlers}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial
        color={color}
        metalness={0.7}
        roughness={0.3}
        emissive={isSelected ? '#ffffff' : '#000000'}
        emissiveIntensity={isSelected ? 0.35 : 0}
      />
    </mesh>
  )
}

function Link({ length, radius, color }: LinkParams) {
  return (
    <mesh position={[0, length / 2, 0]}>
      <cylinderGeometry args={[radius * 0.7, radius, length, 16]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
    </mesh>
  )
}

// Y-axis rotation joints: J1(0), J4(3), J6(5)
const IS_Y_AXIS = [true, false, false, true, false, true]

interface RobotArmProps { showWorkspace: boolean }

export function RobotArm({ showWorkspace }: RobotArmProps) {
  const setTcpPosition  = useRobotStore((s) => s.setTcpPosition)
  const selectedJoint   = useRobotStore((s) => s.selectedJoint)
  const setSelectedJoint = useRobotStore((s) => s.setSelectedJoint)
  const joints          = useRobotStore((s) => s.joints)
  const jointLimits     = useRobotStore((s) => s.jointLimits)
  const isPlaying       = useRobotStore((s) => s.isPlaying)
  const setJoint        = useRobotStore((s) => s.setJoint)

  // Joint group refs
  const j1 = useRef<THREE.Group>(null)
  const j2 = useRef<THREE.Group>(null)
  const j3 = useRef<THREE.Group>(null)
  const j4 = useRef<THREE.Group>(null)
  const j5 = useRef<THREE.Group>(null)
  const j6 = useRef<THREE.Group>(null)
  const tcp = useRef<THREE.Group>(null)

  const jointRefs = [j1, j2, j3, j4, j5, j6] as const

  // Current display angles (rad) — lerped toward target
  const display      = useRef<number[]>(useRobotStore.getState().joints.map((j) => j * DEG))
  const arrivedRef   = useRef(false)
  const tcpFrameRef  = useRef(0)

  const controls = useThree((s) => s.controls) as { enabled: boolean } | null
  const glDom    = useThree((s) => s.gl.domElement)

  // ── Joint sphere drag handlers ──────────────────────────────────────────
  // Uses gl.domElement DOM listeners so pointermove/pointerup fire reliably
  // even when the pointer leaves the mesh hitbox during drag.
  const makeHandlers = (index: number): JointHandlers => {
    const isY = IS_Y_AXIS[index]
    return {
      onPointerDown(e) {
        e.stopPropagation()
        setSelectedJoint(index)
        if (controls) controls.enabled = false

        const onMove = (de: PointerEvent) => {
          const delta = (isY ? de.movementX : -de.movementY) * 0.3
          const { joints: cur, jointLimits: lim } = useRobotStore.getState()
          const next = Math.max(lim[index].min, Math.min(lim[index].max, cur[index] + delta))
          setJoint(index, next)
        }
        const onUp = () => {
          if (controls) controls.enabled = true
          glDom.removeEventListener('pointermove', onMove)
          glDom.removeEventListener('pointerup', onUp)
        }
        glDom.addEventListener('pointermove', onMove)
        glDom.addEventListener('pointerup', onUp)
      },
      onPointerMove() {},
      onPointerUp() {},
    }
  }

  // ── Animation loop ──────────────────────────────────────────────────────
  useFrame((state, delta) => {
    const { joints: target, isPlaying, advancePlayback } = useRobotStore.getState()

    let atTarget = true
    for (let i = 0; i < 6; i++) {
      const t = target[i] * DEG
      const diff = t - display.current[i]
      if (Math.abs(diff) > ARRIVE_THRESHOLD) {
        display.current[i] += diff * Math.min(LERP_SPEED * delta, 1)
        atTarget = false
      } else {
        display.current[i] = t
      }
    }

    if (j1.current) j1.current.rotation.y = display.current[0]
    if (j2.current) j2.current.rotation.z = display.current[1]
    if (j3.current) j3.current.rotation.z = display.current[2]
    if (j4.current) j4.current.rotation.y = display.current[3]
    if (j5.current) j5.current.rotation.z = display.current[4]
    if (j6.current) j6.current.rotation.y = display.current[5]

    // Expose J1 screen position for E2E tests
    if (import.meta.env.DEV && j1.current) {
      const p = new THREE.Vector3()
      j1.current.getWorldPosition(p)
      p.project(state.camera)
      const el = state.gl.domElement
      const rect = el.getBoundingClientRect()
      ;(window as Window & { __j1Screen?: { x: number; y: number } }).__j1Screen = {
        x: rect.x + ((p.x + 1) / 2) * rect.width,
        y: rect.y + ((1 - p.y) / 2) * rect.height,
      }
    }

    if (tcp.current && ++tcpFrameRef.current % 6 === 0) {
      const pos = new THREE.Vector3()
      tcp.current.getWorldPosition(pos)
      setTcpPosition({ x: pos.x.toFixed(3), y: pos.y.toFixed(3), z: pos.z.toFixed(3) })
    }

    if (isPlaying && atTarget && !arrivedRef.current) {
      arrivedRef.current = true
      setTimeout(() => {
        const { isPlaying } = useRobotStore.getState()
        if (isPlaying) advancePlayback()
        arrivedRef.current = false
      }, 300)
    }

    if (!atTarget) arrivedRef.current = false
  })

  const [l0, l1, l2, l3, l4, l5] = LINKS

  // Per-joint visual params (slightly different from JOINT_COLORS which is for UI)
  const COLORS  = ['#4a90d9', '#4a90d9', '#357abd', '#2a6099', '#1e4d7a', '#ff6b35']
  const RADII   = [0.1, 0.09, 0.08, 0.07, 0.065, 0.06]

  return (
    <group>
      {/* ── Base plate ───────────────────────────────────────────────────── */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.12, 32]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ── Robot arm (nested joint groups) ──────────────────────────────── */}
      <group ref={j1}>
        <Joint color={COLORS[0]} radius={RADII[0]} isSelected={selectedJoint === 0} handlers={makeHandlers(0)} />
        <Link {...l0} />
        <group ref={j2} position={[0, l0.length, 0]}>
          <Joint color={COLORS[1]} radius={RADII[1]} isSelected={selectedJoint === 1} handlers={makeHandlers(1)} />
          <Link {...l1} />
          <group ref={j3} position={[0, l1.length, 0]}>
            <Joint color={COLORS[2]} radius={RADII[2]} isSelected={selectedJoint === 2} handlers={makeHandlers(2)} />
            <Link {...l2} />
            <group ref={j4} position={[0, l2.length, 0]}>
              <Joint color={COLORS[3]} radius={RADII[3]} isSelected={selectedJoint === 3} handlers={makeHandlers(3)} />
              <Link {...l3} />
              <group ref={j5} position={[0, l3.length, 0]}>
                <Joint color={COLORS[4]} radius={RADII[4]} isSelected={selectedJoint === 4} handlers={makeHandlers(4)} />
                <Link {...l4} />
                <group ref={j6} position={[0, l4.length, 0]}>
                  <Joint color={COLORS[5]} radius={RADII[5]} isSelected={selectedJoint === 5} handlers={makeHandlers(5)} />
                  <group ref={tcp} position={[0, l5.length, 0]}>
                    <mesh>
                      <octahedronGeometry args={[0.04]} />
                      <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
                    </mesh>
                    {([-0.04, 0.04] as const).map((x) => (
                      <mesh key={x} position={[x, 0.05, 0]}>
                        <boxGeometry args={[0.02, 0.1, 0.02]} />
                        <meshStandardMaterial color="#aaa" metalness={0.8} />
                      </mesh>
                    ))}
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ── Protractors (rendered in world space, positioned via useFrame) ─ */}
      {jointRefs.map((ref, i) =>
        selectedJoint === i ? (
          <JointProtractor
            key={i}
            jointRef={ref}
            isYAxis={IS_Y_AXIS[i]}
            index={i}
            color={JOINT_COLORS[i]}
            name={JOINT_NAMES[i]}
            value={joints[i]}
            min={jointLimits[i].min}
            max={jointLimits[i].max}
            isPlaying={isPlaying}
            onChange={(v) => setJoint(i, v)}
            onClose={() => setSelectedJoint(null)}
          />
        ) : null,
      )}

      {/* ── Workspace sphere ──────────────────────────────────────────────── */}
      {showWorkspace && (
        <mesh>
          <sphereGeometry args={[1.9, 32, 32]} />
          <meshStandardMaterial color="#4a90d9" transparent opacity={0.04} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}
