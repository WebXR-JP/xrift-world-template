import { SpawnPoint } from '@xrift/world-components'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import { DoubleSide } from 'three'

const GradientCylinderMaterial = shaderMaterial(
  { color: [0, 1, 0.53], opacity: 0.5 },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    uniform vec3 color;
    uniform float opacity;
    varying vec2 vUv;
    void main() {
      float alpha = opacity * (1.0 - vUv.y);
      gl_FragColor = vec4(color, alpha);
    }
  `
)

extend({ GradientCylinderMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    gradientCylinderMaterial: React.JSX.IntrinsicElements['shaderMaterial']
  }
}

export interface SpawnPointHelperProps {
  position?: [number, number, number]
  yaw?: number
}

export const SpawnPointHelper: React.FC<SpawnPointHelperProps> = ({
  position = [0, 0, 0],
  yaw = 0,
}) => {
  const yawRad = (yaw * Math.PI) / 180

  return (
    <group position={position}>
      {/* SpawnPoint本体 */}
      <SpawnPoint yaw={yaw} />

      {/* 半透明の円柱（下から上にかけて透明度が増す） */}
      <mesh position={[0, 0.375, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.75, 32, 1, true]} />
        <gradientCylinderMaterial transparent side={DoubleSide} depthWrite={false} />
      </mesh>

      {/* 矢印（向きを示す） - yawに合わせて回転 */}
      <group rotation={[0, -yawRad, 0]}>
        {/* 矢印の軸 */}
        <mesh position={[0, 0.3, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
        {/* 矢印の先端 */}
        <mesh position={[0, 0.3, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.15, 8]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
      </group>
    </group>
  )
}
