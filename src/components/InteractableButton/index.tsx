import { useState, useRef } from 'react'
import { RigidBody } from '@react-three/rapier'
import { Interactable } from '@xrift/world-components'
import { Text } from '@react-three/drei'
import type { Mesh } from 'three'

export interface InteractableButtonProps {
  position?: [number, number, number]
  id?: string
  label?: string
  interactionText?: string
}

/**
 * Interactableを使ったインタラクティブなボタンコンポーネント
 * クリックすると色が変わり、クリック回数をカウントします
 */
export const InteractableButton: React.FC<InteractableButtonProps> = ({
  position = [0, 1, -3],
  id = 'interactive-button',
  label = 'ボタン',
  interactionText = 'ボタンを押す',
}) => {
  const [clickCount, setClickCount] = useState(0)
  const [isPressed, setIsPressed] = useState(false)
  const meshRef = useRef<Mesh>(null)

  const handleInteract = (objectId: string) => {
    console.log(`${objectId} がクリックされました！`)
    setClickCount((prev) => prev + 1)

    // ボタンを押した状態にする
    setIsPressed(true)

    // 0.2秒後に元に戻す
    setTimeout(() => {
      setIsPressed(false)
    }, 200)
  }

  return (
    <group position={position}>
      <Interactable id={id} onInteract={handleInteract} interactionText={interactionText}>
        <RigidBody type="fixed">
          <mesh ref={meshRef} position={[0, 0, isPressed ? -0.05 : 0]} castShadow>
            <boxGeometry args={[1, 0.3, 1]} />
            <meshStandardMaterial
              color={clickCount === 0 ? '#4a9eff' : clickCount < 5 ? '#52c41a' : '#faad14'}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
        </RigidBody>
      </Interactable>

      {/* クリック回数の表示 - ボタンの上部 */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.12}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
      >
        {clickCount > 0 ? `${clickCount}回クリック` : ''}
      </Text>

      {/* ボタンのラベル - ボタンの中央 */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}
