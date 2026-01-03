import { useUsers } from '@xrift/world-components'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

interface PlayerMovement {
  position: { x: number; y: number; z: number }
  rotation: { yaw: number; pitch: number }
}

interface RemoteUserHUDProps {
  userId: string
  displayName: string
  getMovement: (userId: string) => PlayerMovement | undefined
}

const RemoteUserHUD = ({ userId, displayName, getMovement }: RemoteUserHUDProps) => {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    const movement = getMovement(userId)
    if (!movement || !groupRef.current) return

    groupRef.current.position.set(
      movement.position.x,
      movement.position.y + 2,
      movement.position.z
    )
  })

  return (
    <group ref={groupRef}>
      <Text
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {displayName}
      </Text>
    </group>
  )
}

interface LocalUserHUDProps {
  getLocalMovement: () => PlayerMovement
}

const LocalUserHUD = ({ getLocalMovement }: LocalUserHUDProps) => {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    const movement = getLocalMovement()
    if (!movement || !groupRef.current) return

    groupRef.current.position.set(
      movement.position.x,
      movement.position.y + 2.5,
      movement.position.z
    )
  })

  return (
    <group ref={groupRef}>
      <Text
        fontSize={0.15}
        color="cyan"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        (自分)
      </Text>
    </group>
  )
}

export const RemoteUserHUDs = () => {
  const { remoteUsers, getMovement, getLocalMovement } = useUsers()

  return (
    <>
      <LocalUserHUD getLocalMovement={getLocalMovement} />
      {remoteUsers.map((user) => (
        <RemoteUserHUD
          key={user.id}
          userId={user.id}
          displayName={user.displayName}
          getMovement={getMovement}
        />
      ))}
    </>
  )
}
