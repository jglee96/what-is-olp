import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRobotStore } from '../store/robotStore'

const DEG = Math.PI / 180

// 링크 파라미터: [length, radius, color]
const LINK_PARAMS = [
  [0.4, 0.08, '#4a90d9'],  // 베이스 ~ 숄더
  [0.7, 0.07, '#357abd'],  // 숄더 ~ 엘보우
  [0.55, 0.06, '#2a6099'], // 엘보우 ~ 손목1
  [0.12, 0.055, '#1e4d7a'], // 손목1 ~ 손목2
  [0.12, 0.05, '#1e4d7a'],  // 손목2 ~ 손목3
  [0.12, 0.045, '#ff6b35'], // 손목3 ~ TCP (엔드이펙터)
]

function Joint({ position, color = '#888', radius = 0.1 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
    </mesh>
  )
}

function Link({ length, radius, color }) {
  return (
    <mesh position={[0, length / 2, 0]}>
      <cylinderGeometry args={[radius * 0.7, radius, length, 16]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
    </mesh>
  )
}

export default function RobotArm({ showWorkspace }) {
  const joints = useRobotStore(s => s.joints)
  const setTcpPosition = useRobotStore(s => s.setTcpPosition)

  // 각 관절 그룹 ref
  const j1Ref = useRef()
  const j2Ref = useRef()
  const j3Ref = useRef()
  const j4Ref = useRef()
  const j5Ref = useRef()
  const j6Ref = useRef()
  const tcpRef = useRef()

  useFrame(() => {
    const [a1, a2, a3, a4, a5, a6] = joints.map(j => j * DEG)
    if (j1Ref.current) j1Ref.current.rotation.y = a1
    if (j2Ref.current) j2Ref.current.rotation.z = a2
    if (j3Ref.current) j3Ref.current.rotation.z = a3
    if (j4Ref.current) j4Ref.current.rotation.y = a4
    if (j5Ref.current) j5Ref.current.rotation.z = a5
    if (j6Ref.current) j6Ref.current.rotation.y = a6

    // TCP 월드 위치 계산
    if (tcpRef.current) {
      const pos = new THREE.Vector3()
      tcpRef.current.getWorldPosition(pos)
      setTcpPosition({ x: pos.x.toFixed(3), y: pos.y.toFixed(3), z: pos.z.toFixed(3) })
    }
  })

  const [l0, l1, l2, l3, l4, l5] = LINK_PARAMS

  return (
    <group>
      {/* 베이스 플레이트 */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.12, 32]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* J1: 베이스 회전 (Y축) */}
      <group ref={j1Ref} position={[0, 0, 0]}>
        <Joint position={[0, 0, 0]} color="#4a90d9" radius={0.1} />

        {/* Link 1 */}
        <Link length={l0[0]} radius={l0[1]} color={l0[2]} />

        {/* J2: 숄더 (Z축) */}
        <group ref={j2Ref} position={[0, l0[0], 0]}>
          <Joint position={[0, 0, 0]} color="#4a90d9" radius={0.09} />

          {/* Link 2 */}
          <Link length={l1[0]} radius={l1[1]} color={l1[2]} />

          {/* J3: 엘보우 (Z축) */}
          <group ref={j3Ref} position={[0, l1[0], 0]}>
            <Joint position={[0, 0, 0]} color="#357abd" radius={0.08} />

            {/* Link 3 */}
            <Link length={l2[0]} radius={l2[1]} color={l2[2]} />

            {/* J4: 손목 롤 (Y축) */}
            <group ref={j4Ref} position={[0, l2[0], 0]}>
              <Joint position={[0, 0, 0]} color="#2a6099" radius={0.07} />

              {/* Link 4 */}
              <Link length={l3[0]} radius={l3[1]} color={l3[2]} />

              {/* J5: 손목 피치 (Z축) */}
              <group ref={j5Ref} position={[0, l3[0], 0]}>
                <Joint position={[0, 0, 0]} color="#1e4d7a" radius={0.065} />

                {/* Link 5 */}
                <Link length={l4[0]} radius={l4[1]} color={l4[2]} />

                {/* J6: 손목 요 (Y축) */}
                <group ref={j6Ref} position={[0, l4[0], 0]}>
                  <Joint position={[0, 0, 0]} color="#ff6b35" radius={0.06} />

                  {/* 엔드이펙터 (그리퍼) */}
                  <group position={[0, l5[0], 0]} ref={tcpRef}>
                    {/* TCP 마커 */}
                    <mesh position={[0, 0, 0]}>
                      <octahedronGeometry args={[0.04]} />
                      <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
                    </mesh>
                    {/* 그리퍼 핑거 */}
                    <mesh position={[0.04, 0.05, 0]}>
                      <boxGeometry args={[0.02, 0.1, 0.02]} />
                      <meshStandardMaterial color="#aaa" metalness={0.8} />
                    </mesh>
                    <mesh position={[-0.04, 0.05, 0]}>
                      <boxGeometry args={[0.02, 0.1, 0.02]} />
                      <meshStandardMaterial color="#aaa" metalness={0.8} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* 작업 반경 구체 (옵션) */}
      {showWorkspace && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.9, 32, 32]} />
          <meshStandardMaterial
            color="#4a90d9"
            transparent
            opacity={0.04}
            side={THREE.DoubleSide}
            wireframe={false}
          />
        </mesh>
      )}
    </group>
  )
}
