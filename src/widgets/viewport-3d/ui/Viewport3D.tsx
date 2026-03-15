import { Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRobotStore } from '@entities/robot'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { RobotArm } from '@entities/robot'
import { useThemeStore } from '@shared/lib/theme'

// ── E2E test monitor (DEV only) ───────────────────────────────────────────────
// Exposes OrbitControls enabled state as window.__orbitEnabled for Playwright tests
function TestMonitor() {
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null
  useFrame(() => {
    if (import.meta.env.DEV) {
      ;(window as Window & { __orbitEnabled?: boolean }).__orbitEnabled = controls?.enabled ?? true
    }
  })
  return null
}

const GRID_COLORS = {
  dark:  { cell: '#1e2d3d', section: '#2a4060' },
  light: { cell: '#b0c4d8', section: '#88a8c4' },
}

// rerender-memo-with-default-value: 비원시 props를 모듈 레벨로 끌어올려 매 렌더마다 새 객체 생성 방지
const CAMERA_CONFIG = { position: [3, 2.5, 3] as [number, number, number], fov: 45 }
const SHADOW_MAP_SIZE = [2048, 2048] as [number, number]

export function Viewport3D() {
  const [showWorkspace, setShowWorkspace] = useState(false)
  const resolved = useThemeStore((s) => s.resolved)
  const grid = GRID_COLORS[resolved]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useRobotStore.getState().setSelectedJoint(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={CAMERA_CONFIG}
        style={{ background: 'var(--canvas-bg)' }}
        shadows
        onPointerMissed={() => useRobotStore.getState().setSelectedJoint(null)}
      >
        <ambientLight intensity={resolved === 'light' ? 0.7 : 0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={SHADOW_MAP_SIZE} />
        <pointLight position={[-3, 3, -3]} intensity={0.5} color="#4a90d9" />
        <pointLight position={[3, 1, -3]} intensity={0.3} color="#ff6b35" />

        <Grid
          args={[10, 10]}
          position={[0, -0.12, 0]}
          cellColor={grid.cell}
          sectionColor={grid.section}
          fadeDistance={8}
          infiniteGrid
        />

        <mesh position={[0, -0.14, 0]} receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.04, 32]} />
          <meshStandardMaterial
            color={resolved === 'light' ? '#d0d7de' : '#1a1f26'}
            metalness={0.5}
            roughness={0.6}
          />
        </mesh>

        <Suspense fallback={null}>
          <RobotArm showWorkspace={showWorkspace} />
        </Suspense>

        <OrbitControls makeDefault minDistance={1} maxDistance={10} target={[0, 0.8, 0]} />
        {import.meta.env.DEV && <TestMonitor />}

        <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
          <GizmoViewport axisColors={['#ff4444', '#44ff44', '#4444ff']} labelColor={resolved === 'light' ? '#333' : 'white'} />
        </GizmoHelper>
      </Canvas>

      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <button
          onClick={() => setShowWorkspace((v) => !v)}
          style={{
            padding: '6px 12px',
            background: showWorkspace ? 'var(--accent-dim)' : 'var(--bg-secondary)',
            border: `1px solid ${showWorkspace ? 'var(--accent)' : 'var(--border)'}`,
            color: showWorkspace ? 'var(--accent)' : 'var(--text-secondary)',
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
        fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', pointerEvents: 'none',
      }}>
        PERSPECTIVE VIEW · 드래그: 회전 · 스크롤: 줌
      </div>
    </div>
  )
}
