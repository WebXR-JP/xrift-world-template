import { useLoader } from '@react-three/fiber'
import { useXRift } from '@xrift/world-components'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

export interface DracoSampleProps {
  position?: [number, number, number]
  scale?: number
}

/**
 * DRACOLoader で .drc ファイルを直接読み込むサンプル
 * three/addons から import することで shared チャンクとして分離される
 */
export const DracoSample: React.FC<DracoSampleProps> = ({
  position = [0, 0, 0],
  scale = 1,
}) => {
  const { baseUrl } = useXRift()

  const geometry = useLoader(DRACOLoader, `${baseUrl}bunny.drc`, (loader) => {
    loader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
  })

  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color="#c084fc" roughness={0.4} metalness={0.2} />
    </mesh>
  )
}
