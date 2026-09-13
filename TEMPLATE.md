# テンプレート使用ガイド

このドキュメントでは、XRift World Templateを使用して新しいワールドプロジェクトをカスタマイズする方法を説明します。

## プロジェクト名の変更

テンプレートから作成したプロジェクトは、以下のファイルでプロジェクト名を設定する必要があります。

### 1. package.json

```json
{
  "name": "@your-scope/your-world-name",
  "version": "1.0.0",
  "description": "あなたのワールドの説明"
}
```

- `name`: パッケージ名（スコープ付き推奨）
- `version`: 初期バージョン
- `description`: ワールドの簡単な説明

### 2. vite.config.ts

```typescript
federation({
  name: 'your_world_name', // アンダースコア区切り、小文字推奨
  filename: 'remoteEntry.js',
  // ...
})
```

- `name`: Module Federationで使用される識別子
- スペースや特殊文字は使用せず、アンダースコアで区切る

### 3. index.html

```html
<title>Your World Name</title>
```

- 開発時にブラウザで表示されるタイトル

## ワールド内容のカスタマイズ

### ワールドコンポーネントの構造

メインのワールドコンポーネントは `src/World.tsx` にあります。

```tsx
export const World = (props: Props) => {
  return (
    <group {...props}>
      {/* ここに3Dオブジェクトを配置 */}
      <Ground />
      <Walls />
      {/* ... */}
    </group>
  )
}
```

### 新しいオブジェクトの追加

#### 1. シンプルな3Dオブジェクト

```tsx
import { Box } from '@react-three/drei'

function MyBox() {
  return (
    <Box position={[0, 1, 0]} args={[1, 1, 1]}>
      <meshStandardMaterial color="hotpink" />
    </Box>
  )
}
```

#### 2. 物理演算対応オブジェクト

```tsx
import { RigidBody } from '@react-three/rapier'
import { Box } from '@react-three/drei'

function PhysicsBox() {
  return (
    <RigidBody type="fixed">
      <Box position={[0, 1, 0]} args={[1, 1, 1]}>
        <meshStandardMaterial color="blue" />
      </Box>
    </RigidBody>
  )
}
```

RigidBodyの `type` プロパティ：
- `fixed`: 動かない静的オブジェクト（壁、床など）
- `dynamic`: 物理演算で動くオブジェクト
- `kinematicPosition`: スクリプトで位置を制御できるオブジェクト

#### 3. アニメーションの追加

```tsx
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

function RotatingBox() {
  const ref = useRef<Group>(null)

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group ref={ref}>
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color="green" />
      </Box>
    </group>
  )
}
```

### コンポーネントの整理

複雑なワールドを作成する場合は、コンポーネントを分割して管理することを推奨します。

```
src/
  ├── World.tsx              # メインコンポーネント
  ├── components/
  │   ├── Ground.tsx         # 地面
  │   ├── Walls.tsx          # 壁
  │   ├── MyCustomObject.tsx # カスタムオブジェクト
  │   └── ...
  └── index.tsx              # エントリーポイント
```

## ライティングの調整

ワールドの雰囲気を変えるには、ライトの設定を調整します。

```tsx
<group>
  {/* 環境光（全体の明るさ） */}
  <ambientLight intensity={0.5} />

  {/* 太陽光（影を作る） */}
  <directionalLight
    position={[10, 10, 5]}
    intensity={1}
    castShadow
  />

  {/* 点光源 */}
  <pointLight position={[0, 3, 0]} intensity={50} />
</group>
```

## マテリアルとテクスチャ

### 基本的なマテリアル

```tsx
// 単色
<meshStandardMaterial color="red" />

// 金属的
<meshStandardMaterial
  color="silver"
  metalness={1}
  roughness={0.2}
/>

// ガラス風
<meshPhysicalMaterial
  color="white"
  transmission={1}
  thickness={0.5}
  roughness={0}
/>
```

### テクスチャの使用

```tsx
import { useTexture } from '@react-three/drei'
import { useXRift } from '@xrift/world-components'

function TexturedBox() {
  const { baseUrl } = useXRift()
  const texture = useTexture(`${baseUrl}my-texture.jpg`)

  return (
    <Box args={[1, 1, 1]}>
      <meshStandardMaterial map={texture} />
    </Box>
  )
}
```

テクスチャファイルは `public/` 直下に配置してください（`baseUrl` は末尾に `/` を含むため、`${baseUrl}my-texture.jpg` と結合します）。

## 開発時のヒント

### デバッグモード

Rapierの物理演算デバッグビューを有効化：

```tsx
import { Physics, Debug } from '@react-three/rapier'

<Physics gravity={[0, -9.81, 0]}>
  <Debug />
  {/* ワールドコンテンツ */}
</Physics>
```

### パフォーマンス最適化

- 複雑なジオメトリは `useMemo` でメモ化
- 大量のオブジェクトは Instanced Mesh を使用
- テクスチャサイズを適切に調整（大きすぎないように）
- 物理演算の対象を必要最小限に

```tsx
import { Instances, Instance } from '@react-three/drei'

// 同じメッシュを大量に配置する場合
<Instances>
  <boxGeometry />
  <meshStandardMaterial />
  <Instance position={[0, 0, 0]} />
  <Instance position={[2, 0, 0]} />
  {/* ... */}
</Instances>
```

## ビルドとアップロード

### ローカルビルド

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに生成されます。

### 型チェック

デプロイ前に必ず型チェックを実行：

```bash
npm run typecheck
```

### ビルド成果物の確認

```bash
npm run preview
```

ローカルで本番ビルドの動作を確認できます。

## XRiftプラットフォームへのアップロード

詳細は [XRift CLI ドキュメント](https://github.com/WebXR-JP/xrift-cli) を参照してください。

基本的な流れ：

1. プロジェクトをビルド: `npm run build`
2. XRift CLIを使用してアップロード: `npx @xrift/cli upload`

## トラブルシューティング

### ビルドエラーが発生する

- `npm run typecheck` で型エラーを確認
- `node_modules` を削除して再インストール: `rm -rf node_modules && npm install`

### 物理演算が動作しない

- `<Physics>` コンポーネントで正しくラップされているか確認
- RigidBodyの `type` プロパティが正しく設定されているか確認

### パフォーマンスが悪い

- ブラウザの開発者ツールでパフォーマンスをプロファイル
- 物理演算オブジェクトの数を減らす
- テクスチャサイズを縮小
- ライトの数を減らす（特にリアルタイムシャドウ）

## 参考リンク

- [React Three Fiber ドキュメント](https://docs.pmnd.rs/react-three-fiber/)
- [Drei ヘルパー集](https://github.com/pmndrs/drei)
- [Rapier 物理エンジン](https://rapier.rs/)
- [Three.js ドキュメント](https://threejs.org/docs/)
- [XRift CLI](https://github.com/WebXR-JP/xrift-cli)
