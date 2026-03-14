import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { RobotArm } from '@entities/robot'

export function Viewport3D() {
  const [showWorkspace, setShowWorkspace] = useState(false)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [3, 2.5, 3], fov: 45 }}
        style={{ background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)' }}
        shadows
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[-3, 3, -3]} intensity={0.5} color="#4a90d9" />
        <pointLight position={[3, 1, -3]} intensity={0.3} color="#ff6b35" />

        <Grid
          args={[10, 10]}
          position={[0, -0.12, 0]}
          cellColor="#1e2d3d"
          sectionColor="#2a4060"
          fadeDistance={8}
          infiniteGrid
        />

        <mesh position={[0, -0.14, 0]} receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.04, 32]} />
          <meshStandardMaterial color="#1a1f26" metalness={0.5} roughness={0.6} />
        </mesh>

        <Suspense fallback={null}>
          <RobotArm showWorkspace={showWorkspace} />
        </Suspense>

        <OrbitControls makeDefault minDistance={1} maxDistance={10} target={[0, 0.8, 0]} />

        <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
          <GizmoViewport axisColors={['#ff4444', '#44ff44', '#4444ff']} labelColor="white" />
        </GizmoHelper>
      </Canvas>

      {/* 뷰 옵션 */}
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <button
          onClick={() => setShowWorkspace((v) => !v)}
          style={{
            padding: '6px 12px',
            background: showWorkspace ? '#4a90d920' : '#1c2128',
            border: `1px solid ${showWorkspace ? '#4a90d9' : '#30363d'}`,
            color: showWorkspace ? '#4a90d9' : '#8b949e',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'inherit',
          }}
        >
          작업 반경
        </button>
      </div>

      <div style={{
        position: 'absolute', top: 12, left: 12,
        fontSize: 10, color: '#484f58', fontFamily: 'monospace', pointerEvents: 'none',
      }}>
        PERSPECTIVE VIEW · 드래그: 회전 · 스크롤: 줌
      </div>
    </div>
  )
}
