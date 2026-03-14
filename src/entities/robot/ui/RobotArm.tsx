import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRobotStore } from '../model/robotStore'

const DEG = Math.PI / 180
/** lerp 속도. 값이 클수록 빠르게 목표에 수렴 (단위: 1/s) */
const LERP_SPEED = 4
/** 도착 판정 임계값 (radian) */
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

function Joint({ radius = 0.1, color = '#888' }: { radius?: number; color?: string }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
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

interface RobotArmProps { showWorkspace: boolean }

export function RobotArm({ showWorkspace }: RobotArmProps) {
  const setTcpPosition = useRobotStore((s) => s.setTcpPosition)

  const j1 = useRef<THREE.Group>(null)
  const j2 = useRef<THREE.Group>(null)
  const j3 = useRef<THREE.Group>(null)
  const j4 = useRef<THREE.Group>(null)
  const j5 = useRef<THREE.Group>(null)
  const j6 = useRef<THREE.Group>(null)
  const tcp = useRef<THREE.Group>(null)

  // 현재 화면에 실제 렌더링 중인 관절각 (radian)
  const display = useRef<number[]>(
    useRobotStore.getState().joints.map((j) => j * DEG)
  )
  // 도착 후 다음 웨이포인트 전환 딜레이 플래그
  const arrivedRef = useRef(false)
  // TCP 위치 갱신 프레임 카운터 — 60fps → ~10fps로 throttle
  const tcpFrameRef = useRef(0)

  useFrame((_, delta) => {
    const { joints: target, isPlaying, advancePlayback } = useRobotStore.getState()

    // ── 1. lerp display → target ──────────────────────
    let atTarget = true
    for (let i = 0; i < 6; i++) {
      const targetRad = target[i] * DEG
      const diff = targetRad - display.current[i]
      if (Math.abs(diff) > ARRIVE_THRESHOLD) {
        display.current[i] += diff * Math.min(LERP_SPEED * delta, 1)
        atTarget = false
      } else {
        display.current[i] = targetRad
      }
    }

    // ── 2. 관절 회전 적용 ─────────────────────────────
    if (j1.current) j1.current.rotation.y = display.current[0]
    if (j2.current) j2.current.rotation.z = display.current[1]
    if (j3.current) j3.current.rotation.z = display.current[2]
    if (j4.current) j4.current.rotation.y = display.current[3]
    if (j5.current) j5.current.rotation.z = display.current[4]
    if (j6.current) j6.current.rotation.y = display.current[5]

    // ── 3. TCP 월드 위치 (~10fps로 throttle) ─────────
    // rerender-use-ref-transient-values: 매 프레임 Zustand 갱신 대신 6프레임마다 한 번만 UI에 반영
    if (tcp.current && ++tcpFrameRef.current % 6 === 0) {
      const pos = new THREE.Vector3()
      tcp.current.getWorldPosition(pos)
      setTcpPosition({
        x: pos.x.toFixed(3),
        y: pos.y.toFixed(3),
        z: pos.z.toFixed(3),
      })
    }

    // ── 4. 재생 중 도착 시 다음 웨이포인트 진행 ───────
    if (isPlaying && atTarget && !arrivedRef.current) {
      arrivedRef.current = true
      // 0.3s 정지 후 다음 포인트로 이동
      setTimeout(() => {
        const { isPlaying } = useRobotStore.getState()
        if (isPlaying) advancePlayback()
        arrivedRef.current = false
      }, 300)
    }

    if (!atTarget) arrivedRef.current = false
  })

  const [l0, l1, l2, l3, l4, l5] = LINKS

  return (
    <group>
      {/* 베이스 플레이트 */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.12, 32]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* J1 — 베이스 회전 (Y) */}
      <group ref={j1}>
        <Joint color="#4a90d9" radius={0.1} />
        <Link {...l0} />

        {/* J2 — 숄더 (Z) */}
        <group ref={j2} position={[0, l0.length, 0]}>
          <Joint color="#4a90d9" radius={0.09} />
          <Link {...l1} />

          {/* J3 — 엘보우 (Z) */}
          <group ref={j3} position={[0, l1.length, 0]}>
            <Joint color="#357abd" radius={0.08} />
            <Link {...l2} />

            {/* J4 — 손목 롤 (Y) */}
            <group ref={j4} position={[0, l2.length, 0]}>
              <Joint color="#2a6099" radius={0.07} />
              <Link {...l3} />

              {/* J5 — 손목 피치 (Z) */}
              <group ref={j5} position={[0, l3.length, 0]}>
                <Joint color="#1e4d7a" radius={0.065} />
                <Link {...l4} />

                {/* J6 — 손목 요 (Y) */}
                <group ref={j6} position={[0, l4.length, 0]}>
                  <Joint color="#ff6b35" radius={0.06} />

                  {/* 엔드이펙터 & TCP */}
                  <group ref={tcp} position={[0, l5.length, 0]}>
                    <mesh>
                      <octahedronGeometry args={[0.04]} />
                      <meshStandardMaterial
                        color="#00ff88"
                        emissive="#00ff88"
                        emissiveIntensity={0.5}
                      />
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

      {/* 작업 반경 */}
      {showWorkspace && (
        <mesh>
          <sphereGeometry args={[1.9, 32, 32]} />
          <meshStandardMaterial
            color="#4a90d9"
            transparent
            opacity={0.04}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}
