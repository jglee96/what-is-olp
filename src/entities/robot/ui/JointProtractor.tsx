/**
 * JointProtractor — canvas-rendered 3D angle control (AR/XR style)
 *
 * Arc stays in the joint's rotation plane (not billboard).
 * Text labels face the camera (drei Text default).
 * Drag uses gl.domElement DOM listeners so pointer capture works
 * even when the mouse leaves the mesh.
 */
import { useRef, useMemo } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Line, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useRobotStore } from '../model/robotStore'

// ── Constants ─────────────────────────────────────────────────────────────────
const R      = 0.14   // arc radius (world units)
const SEGS   = 80     // arc segments

// Knob: 270° CW sweep, lower-left (-135°) → top → lower-right (-45°)
const ARC_START = -135 * (Math.PI / 180)  // radians
const ARC_SPAN  =  270 * (Math.PI / 180)  // radians, swept clockwise

// ── Arc geometry builder ──────────────────────────────────────────────────────
function buildArc(startRad: number, spanRad: number, r: number, segs: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segs; i++) {
    const a = startRad - (i / segs) * spanRad  // CW = decreasing
    pts.push(new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), 0))
  }
  return pts
}

// ── Tick lines at arc endpoints ───────────────────────────────────────────────
function tickPts(rad: number): THREE.Vector3[] {
  const c = Math.cos(rad), s = Math.sin(rad)
  return [
    new THREE.Vector3((R - 0.018) * c, (R - 0.018) * s, 0),
    new THREE.Vector3((R + 0.018) * c, (R + 0.018) * s, 0),
  ]
}
const TICK_MIN = tickPts(ARC_START)
const TICK_MAX = tickPts(ARC_START - ARC_SPAN)

// ── Props ─────────────────────────────────────────────────────────────────────
interface JointProtractorProps {
  jointRef:  React.RefObject<THREE.Group | null>
  isYAxis:   boolean
  index:     number
  color:     string
  name:      string
  value:     number
  min:       number
  max:       number
  isPlaying: boolean
  onChange:  (v: number) => void
  onClose:   () => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export function JointProtractor({
  jointRef, isYAxis, index,
  color, name, value, min, max,
  isPlaying, onChange, onClose,
}: JointProtractorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null
  const glDom    = useThree((s) => s.gl.domElement)

  const pct        = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const valueSweep = pct * ARC_SPAN
  const handleRad  = ARC_START - valueSweep

  // Pre-allocated temporaries (avoid GC per frame)
  const _pos  = useMemo(() => new THREE.Vector3(), [])
  const _quat = useMemo(() => new THREE.Quaternion(), [])

  // ── Geometry ──────────────────────────────────────────────────────────────
  const trackPts = useMemo(() => buildArc(ARC_START, ARC_SPAN, R, SEGS), [])

  const valuePts = useMemo(() => {
    const segs = Math.max(2, Math.round(SEGS * pct))
    return valueSweep > 0.003 ? buildArc(ARC_START, valueSweep, R, segs) : null
  }, [valueSweep, pct])

  const handlePos = useMemo(
    () => new THREE.Vector3(R * Math.cos(handleRad), R * Math.sin(handleRad), 0),
    [handleRad],
  )

  // ── Align to rotation plane each frame ───────────────────────────────────
  useFrame(() => {
    if (!groupRef.current || !jointRef.current) return
    jointRef.current.getWorldPosition(_pos)
    groupRef.current.position.copy(_pos)

    if (isYAxis) {
      // Y-axis rotation → arc lies flat in XZ plane
      groupRef.current.rotation.set(-Math.PI / 2, 0, 0)
    } else {
      // Z-axis rotation → arc in parent's local XY plane
      jointRef.current.parent?.getWorldQuaternion(_quat)
      groupRef.current.quaternion.copy(_quat)
    }
  })

  // ── Drag via gl.domElement (mouse never loses the joint even when off-mesh) ──
  const isYJoint = [0, 3, 5].includes(index)

  const startDrag = (e: ThreeEvent<PointerEvent>) => {
    if (isPlaying) return
    e.stopPropagation()
    if (controls) controls.enabled = false

    const onMove = (de: PointerEvent) => {
      const delta = (isYJoint ? de.movementX : -de.movementY) * 0.3
      const { joints, jointLimits } = useRobotStore.getState()
      const next = Math.max(
        jointLimits[index].min,
        Math.min(jointLimits[index].max, joints[index] + delta),
      )
      onChange(next)
    }
    const onUp = () => {
      if (controls) controls.enabled = true
      glDom.removeEventListener('pointermove', onMove)
      glDom.removeEventListener('pointerup', onUp)
    }
    glDom.addEventListener('pointermove', onMove)
    glDom.addEventListener('pointerup', onUp)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <group ref={groupRef}>

      {/* Track arc — full range */}
      <Line points={trackPts} color="#555555" lineWidth={2} />
      <Line points={TICK_MIN} color="#555555" lineWidth={2} />
      <Line points={TICK_MAX} color="#555555" lineWidth={2} />

      {/* Value arc — current position */}
      {valuePts && <Line points={valuePts} color={color} lineWidth={5} />}

      {/* Indicator line center → handle */}
      <Line points={[new THREE.Vector3(0, 0, 0), handlePos]} color={color} lineWidth={2} />

      {/* Center pivot */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Handle sphere */}
      <mesh position={handlePos} onPointerDown={startDrag} renderOrder={2}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshStandardMaterial
          color={color} emissive={color} emissiveIntensity={0.5}
          metalness={0.6} roughness={0.2}
        />
      </mesh>

      {/* Invisible larger hit sphere for easier grabbing */}
      <mesh position={handlePos} onPointerDown={startDrag}>
        <sphereGeometry args={[0.034, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Angle value text — billboards to camera */}
      <Text
        position={[0, 0, 0.001]}
        fontSize={0.03}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.003}
        outlineColor="#000000"
      >
        {value.toFixed(1)}°
      </Text>

      {/* Joint name */}
      <Text
        position={[0, R + 0.03, 0.001]}
        fontSize={0.02}
        color="#ffffff"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.002}
        outlineColor="#000000"
        fillOpacity={0.85}
      >
        {name}
      </Text>

      {/* Min label */}
      <Text
        position={[
          (R + 0.028) * Math.cos(ARC_START),
          (R + 0.028) * Math.sin(ARC_START),
          0.001,
        ]}
        fontSize={0.014}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.001}
        outlineColor="#000000"
      >
        {min}°
      </Text>

      {/* Max label */}
      <Text
        position={[
          (R + 0.028) * Math.cos(ARC_START - ARC_SPAN),
          (R + 0.028) * Math.sin(ARC_START - ARC_SPAN),
          0.001,
        ]}
        fontSize={0.014}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.001}
        outlineColor="#000000"
      >
        {max}°
      </Text>

      {/* Close glyph */}
      <Text
        position={[R * 0.7, R * 0.7, 0.001]}
        fontSize={0.022}
        color="#888888"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.002}
        outlineColor="#000000"
        onClick={(e) => { e.stopPropagation(); onClose() }}
      >
        ✕
      </Text>

      {/* Playing badge */}
      {isPlaying && (
        <Text
          position={[0, -0.04, 0.001]}
          fontSize={0.014}
          color="#ff6b35"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.001}
          outlineColor="#000000"
        >
          재생 중
        </Text>
      )}
    </group>
  )
}
