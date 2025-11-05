import { useGLTF } from '@react-three/drei'
import { useXRift } from '@xrift/world-components'

export interface DuckProps {
  position?: [number, number, number]
  scale?: number
}

/**
 * Duck 3Dモデルコンポーネント
 * public/duck.glb を表示します
 */
export const Duck: React.FC<DuckProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const { baseUrl } = useXRift()
  const { scene } = useGLTF(`${baseUrl}duck.glb`)

  return (
    <primitive object={scene} position={position} scale={scale} castShadow receiveShadow />
  )
}
