import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Interactable, useTeleport } from '@xrift/world-components'
import { Text } from '@react-three/drei'
import type { Mesh } from 'three'

interface TeleportPortalProps {
  id: string
  position: [number, number, number]
  destination: [number, number, number]
  yaw?: number
  label?: string
  color?: string
}

export const TeleportPortal = ({
  id,
  position,
  destination,
  yaw,
  label = 'テレポート',
  color = '#8B5CF6',
}: TeleportPortalProps) => {
  const { teleport } = useTeleport()
  const ringRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8
    }
  })

  return (
    <group position={position}>
      <Interactable
        id={id}
        onInteract={() => teleport({ position: destination, yaw })}
        interactionText={label}
      >
        {/* ポータル本体 */}
        <mesh>
          <cylinderGeometry args={[1, 1, 0.05, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* 回転するリング */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.06, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
          />
        </mesh>
      </Interactable>

      {/* ラベル */}
      <Text
        position={[0, 1.6, 0]}
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
