import { useCallback } from 'react'
import { useTeleport } from '@xrift/world-components'
import { RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'

interface TeleportPortalProps {
  position: [number, number, number]
  destination: [number, number, number]
  yaw?: number
  label?: string
  color?: string
}

export const TeleportPortal = ({
  position,
  destination,
  yaw,
  label = 'テレポート',
  color = '#8B5CF6',
}: TeleportPortalProps) => {
  const { teleport } = useTeleport()

  const handleEnter = useCallback(() => {
    teleport({ position: destination, yaw })
  }, [teleport, destination, yaw])

  return (
    <group position={position}>
      {/* センサー: プレイヤーが触れたらテレポート */}
      <RigidBody type="fixed" sensor onIntersectionEnter={handleEnter}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 1, 32]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* 地面のポータル円盤 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* リング */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <torusGeometry args={[1.1, 0.06, 8, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* ラベル */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {label}
      </Text>
    </group>
  )
}
