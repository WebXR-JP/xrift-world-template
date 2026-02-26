import { RigidBody } from '@react-three/rapier'
import { TeleportPortal } from '../TeleportPortal'

const ROOM = {
  center: [0, 0, 50] as [number, number, number],
  width: 10,
  depth: 8,
  height: 4,
  wallThickness: 0.3,
} as const

const WALL_COLOR = '#1a1a2e'
const FLOOR_COLOR = '#16213e'
const ACCENT_COLOR = '#e94560'

/** メインワールドから離れた位置にある隠し部屋 */
export const SecretRoom = () => {
  const [cx, cy, cz] = ROOM.center
  const { width: w, depth: d, height: h, wallThickness: t } = ROOM

  return (
    <group>
      {/* 床 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[cx, cy, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshLambertMaterial color={FLOOR_COLOR} />
        </mesh>
      </RigidBody>

      {/* 天井 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[cx, cy + h, cz]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
          <meshLambertMaterial color={WALL_COLOR} />
        </mesh>
      </RigidBody>

      {/* 壁: 奥（-Z） */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[cx, cy + h / 2, cz - d / 2]} castShadow>
          <boxGeometry args={[w, h, t]} />
          <meshLambertMaterial color={WALL_COLOR} />
        </mesh>
      </RigidBody>

      {/* 壁: 手前（+Z） */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[cx, cy + h / 2, cz + d / 2]} castShadow>
          <boxGeometry args={[w, h, t]} />
          <meshLambertMaterial color={WALL_COLOR} />
        </mesh>
      </RigidBody>

      {/* 壁: 左（-X） */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[cx - w / 2, cy + h / 2, cz]} castShadow>
          <boxGeometry args={[t, h, d]} />
          <meshLambertMaterial color={WALL_COLOR} />
        </mesh>
      </RigidBody>

      {/* 壁: 右（+X） */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[cx + w / 2, cy + h / 2, cz]} castShadow>
          <boxGeometry args={[t, h, d]} />
          <meshLambertMaterial color={WALL_COLOR} />
        </mesh>
      </RigidBody>

      {/* 照明 */}
      <pointLight
        position={[cx, cy + h - 0.5, cz]}
        intensity={8}
        color={ACCENT_COLOR}
        distance={12}
      />
      <pointLight
        position={[cx, cy + 1, cz]}
        intensity={4}
        color="#ffffff"
        distance={8}
      />

      {/* 部屋の装飾: 中央の浮遊キューブ */}
      <mesh position={[cx, cy + 2, cz]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color={ACCENT_COLOR}
          emissive={ACCENT_COLOR}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 帰還ポータル */}
      <TeleportPortal
        position={[cx, cy, cz - 2.5]}
        destination={[0, 0.5, 5]}
        yaw={225}
        label="メインに戻る"
        color="#10B981"
      />
    </group>
  )
}
