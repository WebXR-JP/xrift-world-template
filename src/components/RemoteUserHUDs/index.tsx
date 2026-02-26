import { useUsers } from '@xrift/world-components'
import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, type Group, type Mesh } from 'three'

interface PlayerMovement {
  position: { x: number; y: number; z: number }
  rotation: { yaw: number; pitch: number }
}

const BAR_WIDTH = 0.6
const BAR_HEIGHT = 0.08

const getHpColor = (hpRatio: number): Color => {
  if (hpRatio > 0.5) {
    return new Color(0x00ff00) // 緑
  } else if (hpRatio > 0.25) {
    return new Color(0xffff00) // 黄
  } else {
    return new Color(0xff0000) // 赤
  }
}

interface HpBarProps {
  hp: number
  maxHp: number
}

const HpBar = ({ hp, maxHp }: HpBarProps) => {
  const hpBarRef = useRef<Mesh>(null)
  const hpRatio = hp / maxHp
  const color = useMemo(() => getHpColor(hpRatio), [hpRatio])

  return (
    <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
      <group>
        {/* 背景バー */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[BAR_WIDTH + 0.02, BAR_HEIGHT + 0.02]} />
          <meshBasicMaterial color={0x000000} />
        </mesh>
        {/* HPバー背景（減った部分） */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[BAR_WIDTH, BAR_HEIGHT]} />
          <meshBasicMaterial color={0x333333} />
        </mesh>
        {/* HPバー（現在HP） */}
        <mesh
          ref={hpBarRef}
          position={[-(BAR_WIDTH * (1 - hpRatio)) / 2, 0, 0.01]}
          scale={[hpRatio, 1, 1]}
        >
          <planeGeometry args={[BAR_WIDTH, BAR_HEIGHT]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </Billboard>
  )
}

interface RemoteUserHUDProps {
  userId: string
  getMovement: (userId: string) => PlayerMovement | undefined
  hp: number
  maxHp: number
}

const RemoteUserHUD = ({ userId, getMovement, hp, maxHp }: RemoteUserHUDProps) => {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (!userId) return
    const movement = getMovement(userId)
    if (!movement || !groupRef.current) return

    groupRef.current.position.set(
      movement.position.x,
      movement.position.y + 2.2,
      movement.position.z
    )
  })

  return (
    <group ref={groupRef}>
      <HpBar hp={hp} maxHp={maxHp} />
    </group>
  )
}

interface LocalUserHUDProps {
  getLocalMovement: () => PlayerMovement
  hp: number
  maxHp: number
}

const LocalUserHUD = ({ getLocalMovement, hp, maxHp }: LocalUserHUDProps) => {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    const movement = getLocalMovement()
    if (!movement || !groupRef.current) return

    groupRef.current.position.set(
      movement.position.x,
      movement.position.y + 2.2,
      movement.position.z
    )
  })

  return (
    <group ref={groupRef}>
      <HpBar hp={hp} maxHp={maxHp} />
    </group>
  )
}

// デモ用：ユーザーIDからHPを生成（実際はステート管理で持つ）
const generateHpFromId = (id: string | undefined): number => {
  if (!id) return 50
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  return 30 + Math.abs(hash % 71) // 30〜100
}

export const RemoteUserHUDs = () => {
  const { remoteUsers, getMovement, getLocalMovement } = useUsers()
  const maxHp = 100

  return (
    <>
      <LocalUserHUD getLocalMovement={getLocalMovement} hp={100} maxHp={maxHp} />
      {remoteUsers.map((user) => (
        <RemoteUserHUD
          key={user.id}
          userId={user.id}
          getMovement={getMovement}
          hp={generateHpFromId(user.id)}
          maxHp={maxHp}
        />
      ))}
    </>
  )
}
