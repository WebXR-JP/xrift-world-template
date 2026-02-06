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
import { StrictMode, useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Raycaster, Vector2, Vector3 } from 'three'
import type { Object3D } from 'three'
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

function CenterRaycaster({
  onHitChange,
}: {
  onHitChange: (hit: boolean) => void
}) {
  const { camera, scene } = useThree()
  const raycasterRef = useRef(new Raycaster())
  const ndcRef = useRef(new Vector2(0, 0))
  const currentHitRef = useRef<Object3D | null>(null)
  const wasHitRef = useRef(false)

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

    const isHit = currentHitRef.current !== null
    if (isHit !== wasHitRef.current) {
      wasHitRef.current = isHit
      onHitChange(isHit)
    }
  })

  return null
}

const CROSSHAIR_SIZE = 20
const CROSSHAIR_THICKNESS = 2
const CROSSHAIR_ACTIVE_THICKNESS = 3
const HIGHLIGHT_COLOR = '#4dabf7'

const crosshairStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
  zIndex: 100,
  width: CROSSHAIR_SIZE,
  height: CROSSHAIR_SIZE,
}

const crosshairLineBase: React.CSSProperties = {
  position: 'absolute',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  transition: 'background-color 0.2s ease, width 0.15s ease, height 0.15s ease, box-shadow 0.2s ease',
}

function Crosshair({ active }: { active: boolean }) {
  const color = active ? HIGHLIGHT_COLOR : 'rgba(255, 255, 255, 0.1)'
  const shadow = active ? `0 0 8px ${HIGHLIGHT_COLOR}` : 'none'

  return (
    <div style={crosshairStyle}>
      <div
        style={{
          ...crosshairLineBase,
          top: '50%',
          left: 0,
          width: '100%',
          height: active ? CROSSHAIR_ACTIVE_THICKNESS : CROSSHAIR_THICKNESS,
          transform: 'translateY(-50%)',
          backgroundColor: color,
          boxShadow: shadow,
        }}
      />
      <div
        style={{
          ...crosshairLineBase,
          top: 0,
          left: '50%',
          width: active ? CROSSHAIR_ACTIVE_THICKNESS : CROSSHAIR_THICKNESS,
          height: '100%',
          transform: 'translateX(-50%)',
          backgroundColor: color,
          boxShadow: shadow,
        }}
      />
    </div>
  )
}

const pointerLockContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1001,
  pointerEvents: 'none',
}

const pointerLockStatusBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderRadius: 6,
  fontSize: 12,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  whiteSpace: 'nowrap',
  fontFamily: 'system-ui, sans-serif',
  fontWeight: 500,
}

const pointerLockKbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 6px',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 3,
  fontFamily: 'monospace',
  fontSize: 11,
  fontWeight: 'bold',
  margin: '0 2px',
}

function PointerLockStatus({ isLocked }: { isLocked: boolean }) {
  return (
    <div style={pointerLockContainerStyle}>
      <div
        style={{
          ...pointerLockStatusBase,
          ...(isLocked
            ? {
                background: 'rgba(34, 197, 94, 0.25)',
                color: '#22c55e',
                borderColor: 'rgba(34, 197, 94, 0.3)',
              }
            : {
                background: 'rgba(249, 115, 22, 0.25)',
                color: '#f97316',
                borderColor: 'rgba(249, 115, 22, 0.3)',
              }),
        }}
      >
        <span style={{ fontSize: 14 }}>{isLocked ? '\u{1F512}' : '\u{1F5B1}\uFE0F'}</span>
        <span>
          {isLocked ? (
            <>
              マウスロック中 - <kbd style={pointerLockKbdStyle}>ESC</kbd>で解除
            </>
          ) : (
            '画面をクリックしてマウスロック開始'
          )}
        </span>
      </div>
    </div>
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
    </div>
  )
}

function App() {
  const [isHit, setIsHit] = useState(false)
  const [isPointerLocked, setIsPointerLocked] = useState(false)
  const handleHitChange = useCallback((hit: boolean) => setIsHit(hit), [])

  useEffect(() => {
    const handleChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null)
    }
    document.addEventListener('pointerlockchange', handleChange)
    return () => {
      document.removeEventListener('pointerlockchange', handleChange)
    }
  }, [])

  return (
    <XRiftProvider baseUrl="/">
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <Canvas
          shadows
          camera={{ position: [0, 1.5, 5], fov: 75 }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <FirstPersonControls />
          <CenterRaycaster onHitChange={handleHitChange} />
          <Physics>
            <World />
          </Physics>
        </Canvas>
        <Crosshair active={isHit} />
        <PointerLockStatus isLocked={isPointerLocked} />
        <ControlsHelp />
      </div>
    </XRiftProvider>
  )
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
