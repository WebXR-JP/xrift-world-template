import { useUsers, type User } from '@xrift/world-components'
import { Text } from '@react-three/drei'
import { useEffect, useRef } from 'react'

interface UsersDisplayProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

/**
 * useUsers() hooks の動作確認用ディスプレイコンポーネント
 * インスタンス参加者の一覧を壁に表示する
 *
 * 確認項目:
 * - localUser が取得できること
 * - remoteUsers が取得できること
 * - 他ユーザーが参加/退出した時に remoteUsers が更新されること
 * - 位置更新時に不要な再レンダリングが発生しないこと
 */
export const UsersDisplay = ({
  position = [0, 2, -9],
  rotation = [0, 0, 0],
}: UsersDisplayProps) => {
  const { localUser, remoteUsers } = useUsers()
  const renderCountRef = useRef(0)
  const prevRemoteUsersRef = useRef<User[]>([])

  // レンダリング回数をカウント
  renderCountRef.current += 1

  // ユーザー情報の変化をコンソールに出力
  useEffect(() => {
    console.log('[UsersDisplay] localUser:', localUser)
    console.log('[UsersDisplay] remoteUsers:', remoteUsers)
    console.log('[UsersDisplay] renderCount:', renderCountRef.current)
  }, [localUser, remoteUsers])

  // remoteUsersの変化を検知（参加/退出）
  useEffect(() => {
    const prevIds = new Set(prevRemoteUsersRef.current.map((u) => u.id))
    const currentIds = new Set(remoteUsers.map((u) => u.id))

    // 新規参加ユーザーを検知
    for (const user of remoteUsers) {
      if (!prevIds.has(user.id)) {
        console.log('[UsersDisplay] User joined:', user)
      }
    }

    // 退出ユーザーを検知
    for (const user of prevRemoteUsersRef.current) {
      if (!currentIds.has(user.id)) {
        console.log('[UsersDisplay] User left:', user)
      }
    }

    prevRemoteUsersRef.current = remoteUsers
  }, [remoteUsers])

  // 参加者一覧テキストを生成
  const generateUsersText = () => {
    const lines: string[] = []

    lines.push('=== Users ===')
    lines.push('')

    // ローカルユーザー
    if (localUser?.displayName) {
      lines.push(`* ${localUser.displayName} (you)`)
    } else {
      lines.push('* (Not connected)')
    }

    // リモートユーザー
    for (const user of remoteUsers) {
      lines.push(`* ${user.displayName ?? '???'}`)
    }

    return lines.join('\n')
  }

  return (
    <group position={position} rotation={rotation}>
      {/* 背景パネル */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial color="#222222" opacity={0.9} transparent />
      </mesh>

      {/* テキスト表示 */}
      <Text
        position={[0, 0, 0.02]}
        fontSize={0.12}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
        textAlign="left"
        font="https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Me5Q.ttf"
      >
        {generateUsersText()}
      </Text>
    </group>
  )
}
