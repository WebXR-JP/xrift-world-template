/**
 * 開発環境用エントリーポイント
 *
 * ローカル開発時（npm run dev）に使用されます。
 * 本番ビルド（npm run build）では使用されません。
 *
 * 操作方法:
 * - 画面クリックでポインターロック開始
 * - マウスで視点操作、WASD / 矢印キーで移動
 * - Space / E ジャンプ、Q 下降
 * - インタラクト可能オブジェクトに照準を合わせてクリック
 * - ESC でポインターロック解除
 */

import { LAYERS, XRiftProvider } from '@xrift/world-components'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  CapsuleCollider,
  CuboidCollider,
  Physics,
  RigidBody,
} from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { PointerLockControls } from '@react-three/drei'
import { StrictMode, useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PCFShadowMap, Raycaster, Vector2, Vector3 } from 'three'
import type { Group, Mesh, Object3D } from 'three'
import { World } from './World'
import xriftConfig from '../xrift.json'

// --- 物理定数（xrift-frontend 準拠） ---
const PLAYER_HALF_HEIGHT = 0.4
const PLAYER_RADIUS = 0.4
const MOVE_SPEED = 5.0
const JUMP_VELOCITY = 4.5
const LINEAR_DAMPING = 0.2
const CAMERA_Y_OFFSET = 0.64
const RESPAWN_Y_THRESHOLD = -10
const SPAWN_POSITION: [number, number, number] = [0.11, 1.6, 7.59]

const physicsConfig = (xriftConfig as { physics?: { gravity?: number; allowInfiniteJump?: boolean } }).physics
const GRAVITY = physicsConfig?.gravity ?? 9.81
const ALLOW_INFINITE_JUMP = physicsConfig?.allowInfiniteJump ?? true

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

function PhysicsPlayer() {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const avatarGroupRef = useRef<Group>(null)
  const headRef = useRef<Mesh>(null)
  const pressedKeysRef = useRef<Set<string>>(new Set())
  const isGroundedRef = useRef(false)
  const prevSpaceRef = useRef(false)
  const forwardRef = useRef(new Vector3())
  const rightRef = useRef(new Vector3())

  const { camera } = useThree()

  // アバターを三人称レイヤーに設定（一人称カメラには映らない）
  useEffect(() => {
    avatarGroupRef.current?.traverse((obj) => {
      obj.layers.set(LAYERS.THIRD_PERSON_ONLY)
    })
  }, [])

  useEffect(() => {
    const shouldHandle = (event: KeyboardEvent) => {
      if (event.isComposing) return false
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return false
      return true
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!shouldHandle(event)) return
      const code = event.code
      if (!pressedKeysRef.current.has(code)) {
        pressedKeysRef.current.add(code)
      }
      if (event.key) {
        pressedKeysRef.current.add(event.key)
      }
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!shouldHandle(event)) return
      pressedKeysRef.current.delete(event.code)
      if (event.key) {
        pressedKeysRef.current.delete(event.key)
      }
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }

    const options = { passive: false, capture: true }
    window.addEventListener('keydown', handleKeyDown, options)
    window.addEventListener('keyup', handleKeyUp, options)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, options)
      window.removeEventListener('keyup', handleKeyUp, options)
    }
  }, [])

  useFrame(() => {
    const rb = rigidBodyRef.current
    if (!rb) return

    const keys = pressedKeysRef.current

    // --- 移動ベクトル算出 ---
    const fwd =
      (keys.has('KeyW') || keys.has('w') || keys.has('ArrowUp') ? 1 : 0) +
      (keys.has('KeyS') || keys.has('s') || keys.has('ArrowDown') ? -1 : 0)
    const strafe =
      (keys.has('KeyD') || keys.has('d') || keys.has('ArrowRight') ? 1 : 0) +
      (keys.has('KeyA') || keys.has('a') || keys.has('ArrowLeft') ? -1 : 0)

    camera.getWorldDirection(forwardRef.current)
    forwardRef.current.y = 0
    forwardRef.current.normalize()
    rightRef.current.crossVectors(forwardRef.current, camera.up).normalize()

    let moveX = forwardRef.current.x * fwd + rightRef.current.x * strafe
    let moveZ = forwardRef.current.z * fwd + rightRef.current.z * strafe
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ)
    if (len > 0) {
      moveX = (moveX / len) * MOVE_SPEED
      moveZ = (moveZ / len) * MOVE_SPEED
    }

    // --- ジャンプ ---
    const currentVel = rb.linvel()
    const spacePressed = keys.has('Space') || keys.has(' ') || keys.has('KeyE') || keys.has('e')
    let vy = currentVel.y

    if (ALLOW_INFINITE_JUMP) {
      if (spacePressed) {
        vy = JUMP_VELOCITY
      }
    } else {
      const spaceEdge = spacePressed && !prevSpaceRef.current
      if (spaceEdge && isGroundedRef.current) {
        vy = JUMP_VELOCITY
      }
    }
    prevSpaceRef.current = spacePressed

    rb.setLinvel({ x: moveX, y: vy, z: moveZ }, true)

    // --- カメラ位置同期 ---
    const pos = rb.translation()
    camera.position.set(pos.x, pos.y + CAMERA_Y_OFFSET, pos.z)

    // --- DummyAvatar 位置同期 ---
    if (avatarGroupRef.current) {
      avatarGroupRef.current.position.set(pos.x, pos.y + CAMERA_Y_OFFSET, pos.z)
      camera.getWorldDirection(forwardRef.current)
      const yaw = -Math.atan2(forwardRef.current.x, -forwardRef.current.z)
      const pitch = Math.asin(forwardRef.current.y)
      avatarGroupRef.current.rotation.set(0, yaw, 0)
      if (headRef.current) {
        headRef.current.rotation.set(pitch, 0, 0)
      }
    }

    // --- リスポーン ---
    if (pos.y < RESPAWN_Y_THRESHOLD) {
      rb.setTranslation(
        { x: SPAWN_POSITION[0], y: SPAWN_POSITION[1], z: SPAWN_POSITION[2] },
        true,
      )
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  const height = 1.5

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        type="dynamic"
        position={SPAWN_POSITION}
        lockRotations
        friction={0}
        restitution={0}
        linearDamping={LINEAR_DAMPING}
        enabledRotations={[false, false, false]}
      >
        <CapsuleCollider args={[PLAYER_HALF_HEIGHT, PLAYER_RADIUS]} />
        <CuboidCollider
          args={[PLAYER_RADIUS * 0.9, 0.05, PLAYER_RADIUS * 0.9]}
          position={[0, -(PLAYER_HALF_HEIGHT + PLAYER_RADIUS), 0]}
          sensor
          onIntersectionEnter={() => {
            isGroundedRef.current = true
          }}
          onIntersectionExit={() => {
            isGroundedRef.current = false
          }}
        />
      </RigidBody>

      {/* DummyAvatar - RigidBody 外に配置し useFrame で位置同期 */}
      <group ref={avatarGroupRef}>
        <mesh castShadow ref={headRef}>
          <boxGeometry args={[0.2, 0.1, 0.2]} />
          <meshLambertMaterial color="#ffcccc" />
        </mesh>
        <mesh castShadow position={[0, -height * 0.55, 0]}>
          <boxGeometry args={[0.3, height, 0.1]} />
          <meshLambertMaterial color="#ccffcc" />
        </mesh>
      </group>
    </>
  )
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
    raycaster.far = 3.5
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
        <Kbd>Space</Kbd>
        <Kbd>E</Kbd> ジャンプ
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
          shadows={{ type: PCFShadowMap }}
          camera={{ position: SPAWN_POSITION, fov: 50, near: 0.01, far: 1000 }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <PointerLockControls />
          <CenterRaycaster onHitChange={handleHitChange} />
          <Physics gravity={[0, -GRAVITY, 0]} timeStep="vary">
            <PhysicsPlayer />
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
