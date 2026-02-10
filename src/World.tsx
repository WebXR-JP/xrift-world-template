import { LiveVideoPlayer, Mirror, ScreenShareDisplay, SpawnPoint, VideoPlayer } from '@xrift/world-components'
import { RigidBody } from '@react-three/rapier'
import { useRef } from 'react'
import { Mesh } from 'three'
import { Duck } from './components/Duck'
import { InteractableButton } from './components/InteractableButton'
import { RemoteUserHUDs } from './components/RemoteUserHUDs'
import { RotatingObject } from './components/RotatingObject'
import { Skybox } from './components/Skybox'
import { COLORS, WORLD_CONFIG } from './constants'

export interface WorldProps {
  position?: [number, number, number]
  scale?: number
}

export const World: React.FC<WorldProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const groundRef = useRef<Mesh>(null)
  const worldSize = WORLD_CONFIG.size * scale
  const wallHeight = WORLD_CONFIG.wallHeight * scale
  const wallThickness = WORLD_CONFIG.wallThickness * scale

  return (
    <group position={position} scale={scale}>
      {/* Skybox - 360度パノラマ背景 */}
      <Skybox radius={500} />

      {/* プレイヤーのスポーン地点 */}
      <group position={[0.11, 0, 7.59]} rotation={[0, 0, 0]}>
        <SpawnPoint />
      </group>

      {/* 照明設定 */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      {/* 地面 */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>
        <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[worldSize, worldSize]} />
          <meshLambertMaterial color={COLORS.ground} />
        </mesh>
      </RigidBody>

      {/* 壁1 */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>
        <mesh position={[worldSize / 2, wallHeight / 2, 0]} castShadow>
          <boxGeometry args={[wallThickness, wallHeight, worldSize]} />
          <meshLambertMaterial color={COLORS.wall} />
        </mesh>
      </RigidBody>

      {/* 壁2 */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>
        <mesh position={[-worldSize / 2, wallHeight / 2, 0]} castShadow>
          <boxGeometry args={[wallThickness, wallHeight, worldSize]} />
          <meshLambertMaterial color={COLORS.wall} />
        </mesh>
      </RigidBody>

      {/* 壁3 */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>
        <mesh position={[0, wallHeight / 2, worldSize / 2]} castShadow>
          <boxGeometry args={[worldSize, wallHeight, wallThickness]} />
          <meshLambertMaterial color={COLORS.wall} />
        </mesh>
      </RigidBody>

      {/* 壁4 */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>
        <mesh position={[0, wallHeight / 2, -worldSize / 2]} castShadow>
          <boxGeometry args={[worldSize, wallHeight, wallThickness]} />
          <meshLambertMaterial color={COLORS.wall} />
        </mesh>
      </RigidBody>

      {/* いくつかの装飾オブジェクト */}
      <RigidBody type="fixed" colliders="hull" restitution={0} friction={0}>
        <mesh position={[3 * scale, 1 * scale, 3 * scale]} castShadow>
          <boxGeometry args={[2 * scale, 2 * scale, 2 * scale]} />
          <meshLambertMaterial color={COLORS.decorations.box} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="hull" restitution={0} friction={0}>
        <mesh position={[-3 * scale, 0.5 * scale, -3 * scale]} castShadow>
          <cylinderGeometry args={[1 * scale, 1 * scale, 1 * scale]} />
          <meshLambertMaterial color={COLORS.decorations.cylinder} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="ball" restitution={0} friction={0}>

      </RigidBody>

      {/* 0.1mの低い段差 */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>
        <mesh position={[-6 * scale, 0.05 * scale, 2 * scale]} castShadow>
          <boxGeometry args={[2 * scale, 0.1 * scale, 1 * scale]} />
          <meshLambertMaterial color="#00FF00" />
        </mesh>
      </RigidBody>

      {/* 0.2mの段差（設定上限） */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>
        <mesh position={[-6 * scale, 0.1 * scale, 0 * scale]} castShadow>
          <boxGeometry args={[2 * scale, 0.2 * scale, 1 * scale]} />
          <meshLambertMaterial color="#FFFF00" />
        </mesh>
      </RigidBody>

      {/* 0.3mの少し高い段差 */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>
        <mesh position={[-6 * scale, 0.15 * scale, -2 * scale]} castShadow>
          <boxGeometry args={[2 * scale, 0.3 * scale, 1 * scale]} />
          <meshLambertMaterial color="#FF8800" />
        </mesh>
      </RigidBody>

      {/* 0.5mの高い段差 */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>
        <mesh position={[-6 * scale, 0.25 * scale, -4 * scale]} castShadow>
          <boxGeometry args={[2 * scale, 0.5 * scale, 1 * scale]} />
          <meshLambertMaterial color="#FF0000" />
        </mesh>
      </RigidBody>

      {/* 階段状のオブジェクト */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>

      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>

      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>

      </RigidBody>

      {/* 狭い隙間テスト */}
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>

      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" restitution={0} friction={0}>

      </RigidBody>

      {/* 鏡 - ワールドの中央に配置 */}
      <Mirror
        position={[0, 2.5 * scale, -9.5]}
        size={[4 * scale, 3 * scale]}
      />

      <VideoPlayer
        id='sample-video'
        position={[9.72, 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        width={4}
        url='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        playing
        volume={0}
      />

      {/* ライブ配信プレイヤー - 前の壁に配置 */}
      <LiveVideoPlayer
        id='sample-live'
        position={[0, 2, 9.72]}
        rotation={[0, Math.PI, 0]}
        width={4}
        url='https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8'
        volume={0}
      />

      {/* 画面共有ディスプレイ - 左側の壁に配置 */}
      <ScreenShareDisplay
        id='screen-share-1'
        position={[-9.72, 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* アニメーション: ぐるぐる回るオブジェクト */}
      <RotatingObject
        radius={4}
        speed={1}
        height={2}
        scale={scale}
      />

      {/* Duck 3Dモデル - useXRiftの使用例 */}
      <RigidBody type="dynamic" colliders="cuboid" restitution={0} friction={0}>
        <Duck position={[-2, 0.5, 0]} scale={1} />
      </RigidBody>

      {/* Interactableボタン - クリック可能なオブジェクトの例（ローカルステート） */}
      <InteractableButton
        position={[0, 1, -3]}
        id="sample-button-1"
        label="ローカル"
        interactionText="ボタンをクリック"
        useGlobalState={false}
      />

      {/* 別のInteractableボタン（グローバルステート - インスタンス全体で同期） */}
      <InteractableButton
        position={[2.5, 1, -3]}
        id="sample-button-2"
        label="グローバル"
        interactionText="カウントアップ"
        useGlobalState={true}
      />

      {/* ユーザーの位置情報HUD - useUsers() APIの検証用 */}
      <RemoteUserHUDs />
    </group>
  )
}
