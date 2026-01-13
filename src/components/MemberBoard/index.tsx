import { useUsers } from '@xrift/world-components'
import { Text, Image } from '@react-three/drei'
import { Suspense } from 'react'

interface MemberItemProps {
  avatarUrl: string | null
  displayName: string
  index: number
}

const MemberItem = ({ avatarUrl, displayName, index }: MemberItemProps) => {
  const yOffset = -index * 0.4

  return (
    <group position={[0, yOffset, 0.01]}>
      {/* アイコン */}
      {avatarUrl && (
        <Suspense fallback={null}>
          <Image
            url={avatarUrl}
            position={[-0.7, 0, 0]}
            scale={[0.3, 0.3]}
          />
        </Suspense>
      )}
      {/* 名前 */}
      <Text
        position={[-0.45, 0, 0]}
        fontSize={0.15}
        color="white"
        anchorX="left"
        anchorY="middle"
        maxWidth={1.2}
      >
        {displayName}
      </Text>
    </group>
  )
}

interface MemberBoardProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export const MemberBoard = ({ position = [0, 2, -9], rotation = [0, 0, 0] }: MemberBoardProps) => {
  const { remoteUsers, localUser } = useUsers()

  const allMembers = [
    ...(localUser ? [{ avatarUrl: localUser.avatarUrl, displayName: `${localUser.displayName} (自分)` }] : []),
    ...remoteUsers.map(user => ({ avatarUrl: user.avatarUrl, displayName: user.displayName }))
  ]

  return (
    <group position={position} rotation={rotation}>
      {/* タイトル */}
      <Text
        position={[0, 0.4, 0.01]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        Members
      </Text>

      {/* メンバーリスト */}
      <group position={[0, 0, 0]}>
        {allMembers.map((member, index) => (
          <MemberItem
            key={member.displayName + index}
            avatarUrl={member.avatarUrl}
            displayName={member.displayName}
            index={index}
          />
        ))}
      </group>
    </group>
  )
}
