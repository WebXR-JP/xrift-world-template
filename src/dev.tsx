/**
 * 開発環境用エントリーポイント
 *
 * ローカル開発時（npm run dev）に使用されます。
 * 本番ビルド（npm run build）では使用されません。
 *
 * 操作方法:
 * - 画面クリックでポインターロック開始
 * - マウスで視点操作、WASD / 矢印キーで移動
 * - Q / E で上昇 / 下降
 * - インタラクト可能オブジェクトに照準を合わせてクリック
 * - ESC でポインターロック解除
 */

import { LAYERS, XRiftProvider } from '@xrift/world-components'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { PointerLockControls } from '@react-three/drei'
import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Color, Raycaster, Vector2, Vector3 } from 'three'
import type { Mesh, Object3D } from 'three'
import { World } from './World'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

function FirstPersonControls() {
  const pressedKeysRef = useRef<Set<string>>(new Set())
  const forwardRef = useRef(new Vector3())
  const rightRef = useRef(new Vector3())
  const moveRef = useRef(new Vector3())

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      pressedKeysRef.current.add(event.code)
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeysRef.current.delete(event.code)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(({ camera }, delta) => {
    const keys = pressedKeysRef.current
    const forward =
      (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) +
      (keys.has('KeyS') || keys.has('ArrowDown') ? -1 : 0)
    const strafe =
      (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) +
      (keys.has('KeyA') || keys.has('ArrowLeft') ? -1 : 0)
    const vertical =
      (keys.has('KeyE') || keys.has('Space') ? 1 : 0) +
      (keys.has('KeyQ') ? -1 : 0)

    if (forward === 0 && strafe === 0 && vertical === 0) return

    camera.getWorldDirection(forwardRef.current)
    forwardRef.current.y = 0
    forwardRef.current.normalize()
    rightRef.current.crossVectors(forwardRef.current, camera.up).normalize()

    moveRef.current
      .set(0, 0, 0)
      .addScaledVector(forwardRef.current, forward)
      .addScaledVector(rightRef.current, strafe)

    const horizontalLength = moveRef.current.length()
    if (horizontalLength > 0) moveRef.current.normalize()
    moveRef.current.multiplyScalar(4 * delta)
    moveRef.current.y += vertical * 4 * delta

    camera.position.add(moveRef.current)
  })

  return <PointerLockControls />
}

function CenterRaycaster() {
  const { camera, scene } = useThree()
  const raycasterRef = useRef(new Raycaster())
  const ndcRef = useRef(new Vector2(0, 0))
  const markerRef = useRef<Mesh>(null)
  const currentHitRef = useRef<Object3D | null>(null)
  const directionRef = useRef(new Vector3())
  const markerOffsetRef = useRef(new Vector3())

  useEffect(() => {
    const handleClick = () => {
      let node = currentHitRef.current
      while (node) {
        const userData = node.userData as {
          onInteract?: (id: string) => void
          id?: string
        }
        if (typeof userData.onInteract === 'function') {
          userData.onInteract(userData.id ?? '')
          return
        }
        node = node.parent
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('mousedown', handleClick)
    }
  }, [])

  useFrame(() => {
    const raycaster = raycasterRef.current
    raycaster.layers.set(LAYERS.INTERACTABLE)
    raycaster.setFromCamera(ndcRef.current, camera)
    const hits = raycaster.intersectObjects(scene.children, true)
    currentHitRef.current = hits.length > 0 ? hits[0].object : null

    camera.getWorldDirection(directionRef.current)
    markerOffsetRef.current.copy(directionRef.current).multiplyScalar(1.5)
    if (markerRef.current) {
      markerRef.current.position
        .copy(camera.position)
        .add(markerOffsetRef.current)
      markerRef.current.quaternion.copy(camera.quaternion)
    }
  })

  return (
    <mesh ref={markerRef}>
      <sphereGeometry args={[0.01, 4, 4]} />
      <meshStandardMaterial
        color={new Color('#ffcf5c')}
        emissive={new Color('#ffcf5c')}
      />
    </mesh>
  )
}

const controlsHelpStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 16,
  left: 16,
  padding: '10px 14px',
  background: 'rgba(0, 0, 0, 0.55)',
  color: '#fff',
  borderRadius: 8,
  fontSize: 12,
  lineHeight: 1.7,
  pointerEvents: 'none',
  userSelect: 'none',
  fontFamily: 'system-ui, sans-serif',
  backdropFilter: 'blur(4px)',
}

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 5px',
  background: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 3,
  fontSize: 11,
  fontFamily: 'inherit',
  marginRight: 2,
}

function ControlsHelp() {
  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd style={kbdStyle}>{children}</kbd>
  )

  return (
    <div style={controlsHelpStyle}>
      <div>
        <Kbd>Click</Kbd> ロック開始 / インタラクト
      </div>
      <div>
        <Kbd>W</Kbd>
        <Kbd>A</Kbd>
        <Kbd>S</Kbd>
        <Kbd>D</Kbd> 移動
      </div>
      <div>
        <Kbd>Q</Kbd> 下降 <Kbd>E</Kbd>
        <Kbd>Space</Kbd> 上昇
      </div>
      <div>
        <Kbd>ESC</Kbd> ロック解除
      </div>
    </div>
  )
}

createRoot(rootElement).render(
  <StrictMode>
    {/* 開発環境用のProvider - ベースパスを指定 */}
    <XRiftProvider baseUrl="/">
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <Canvas
          shadows
          camera={{ position: [0, 1.5, 5], fov: 75 }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <FirstPersonControls />
          <CenterRaycaster />
          <Physics>
            <World />
          </Physics>
        </Canvas>
        <ControlsHelp />
      </div>
    </XRiftProvider>
  </StrictMode>
)
