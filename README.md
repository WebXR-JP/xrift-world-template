# XRift World Template

XRiftで動作するWebXRワールドを作成するための公式テンプレートです。

## 概要

このテンプレートは、XRift CLIで新しいワールドプロジェクトを作成する際に使用されます。React Three Fiber、Rapier物理エンジン、Three.jsを使用した3Dワールドの基本構成がセットアップ済みで、すぐに開発を始められます。

## このテンプレートに含まれる機能

- **React Three Fiber**: Reactコンポーネントとして3Dシーンを構築
- **Rapier物理エンジン**: リアルな物理演算（衝突判定、重力など）
- **Three.js**: WebGLベースの3Dグラフィックス
- **Module Federation**: XRiftプラットフォームでの動的読み込み対応
- **TypeScript**: 型安全な開発環境
- **サンプルワールド**: 物理演算やオブジェクト配置の実装例

### サンプルワールドの内容

- 20m × 20mの閉じた空間
- 物理演算対応（壁、地面との衝突判定）
- 段差テスト用オブジェクト（0.1m, 0.2m, 0.3m, 0.5m）
- 階段構造
- 狭い隙間テスト
- 鏡（Reflector使用）
- アニメーション実装例（回転するオブジェクト）

## 使い方

### 1. XRift CLIをインストール

```bash
npm install -g @xrift/cli
```

### 2. XRiftにログイン

```bash
xrift login
```

### 3. 新しいワールドプロジェクトを作成

```bash
xrift create my-world
```

このコマンドで、このテンプレートを基にした新しいプロジェクトが作成されます。

### 4. 開発サーバーを起動

```bash
cd my-world
npm install
npm run dev
```

### 5. カスタマイズ

- `src/World.tsx`: メインのワールドコンポーネント
- `src/components/`: 各種3Dオブジェクトのコンポーネント
- `vite.config.ts`: ビルド設定
- `package.json`: プロジェクト情報

詳細なカスタマイズ方法は [TEMPLATE.md](./TEMPLATE.md) を参照してください。

#### アセット（GLTFモデル、テクスチャ）の読み込み

XRiftでは、ワールドのアセットは自動的にCDNにアップロードされ、適切なベースURLが注入されます。アセットを読み込む際は、`@xrift/world-components`パッケージの`useXRift`フックを使用してベースURLを取得してください。

```typescript
import { useXRift } from '@xrift/world-components'
import { useGLTF, useTexture } from '@react-three/drei'

function MyModel() {
  const { baseUrl } = useXRift()

  // ベースURLと相対パスを結合してGLTFモデルを読み込む
  const gltf = useGLTF(`${baseUrl}models/robot.gltf`)

  return <primitive object={gltf.scene} />
}

function MyMaterial() {
  const { baseUrl } = useXRift()

  // テクスチャを読み込む
  const texture = useTexture(`${baseUrl}textures/albedo.png`)

  return <meshStandardMaterial map={texture} />
}

function MyPBRMaterial() {
  const { baseUrl } = useXRift()

  // 複数のテクスチャを同時に読み込む
  const [albedo, normal, roughness] = useTexture([
    `${baseUrl}textures/albedo.png`,
    `${baseUrl}textures/normal.png`,
    `${baseUrl}textures/roughness.png`,
  ])

  return (
    <meshStandardMaterial
      map={albedo}
      normalMap={normal}
      roughnessMap={roughness}
    />
  )
}
```

**重要**: アセットパスを指定する際は、必ず`useXRift()`で取得した`baseUrl`を使用してください。これにより、XRiftプラットフォーム上で正しくアセットが読み込まれます。

##### アセットファイルの配置

アセットファイル（GLBモデル、テクスチャ画像など）は`public/`ディレクトリに配置してください。

```
your-world-project/
├── public/
│   ├── models/
│   │   └── robot.glb
│   ├── textures/
│   │   ├── albedo.png
│   │   ├── normal.png
│   │   └── roughness.png
│   └── skybox.jpg
├── src/
│   └── World.tsx
└── package.json
```

`public/`内のファイルは、ビルド時に自動的にCDNにアップロードされ、`baseUrl`経由でアクセスできるようになります。

##### ローカル開発環境での設定

ローカルで開発する際は、`@xrift/world-components`の`XRiftProvider`を使用してベースURLを設定してください。

```typescript
// src/dev.tsx（開発用エントリーポイント）
import { XRiftProvider } from '@xrift/world-components'
import { World } from './World'

function App() {
  return (
    <XRiftProvider baseUrl="/">
      <Canvas>
        <Physics>
          <World />
        </Physics>
      </Canvas>
    </XRiftProvider>
  )
}
```

本番環境（XRiftプラットフォーム上）では、フロントエンド側が自動的に`XRiftProvider`でワールドコンポーネントをラップするため、ワールド側で`XRiftProvider`を使用する必要はありません。

#### プレイヤーのスポーン地点を設定する

`src/components/SpawnPoint`の`SpawnPoint`コンポーネントを使用すると、プレイヤーがワールドに入った時の初期位置と向きを設定できます。このコンポーネントは`@xrift/world-components`のSpawnPointをラップし、開発時に位置と向きを視覚的に確認できるヘルパー表示を追加しています。

```typescript
import { SpawnPoint } from './components/SpawnPoint'

function World() {
  return (
    <group>
      {/* プレイヤーのスポーン地点 */}
      <SpawnPoint position={[0, 0, 5]} yaw={180} />

      {/* 他のワールド要素 */}
    </group>
  )
}
```

##### SpawnPointのプロパティ

- `position` (任意): スポーン位置 `[x, y, z]`。デフォルトは `[0, 0, 0]`
- `yaw` (任意): スポーン時のY軸回転角度（度数法）。デフォルトは `0`（Z軸負方向を向く）

##### 使用例

このテンプレートでは、`src/World.tsx`でプレイヤーがワールドの中央やや手前（Z=5）に、原点方向（yaw=180）を向いてスポーンするように設定されています。開発時には半透明の円柱と矢印でスポーン位置と向きが表示されます。

#### インタラクティブなオブジェクトの作成

`@xrift/world-components`の`Interactable`コンポーネントを使用すると、ユーザーがクリック（インタラクト）できる3Dオブジェクトを簡単に作成できます。

```typescript
import { Interactable } from '@xrift/world-components'
import { RigidBody } from '@react-three/rapier'

function InteractiveButton() {
  const handleClick = (id: string) => {
    console.log(`${id} がクリックされました！`)
    // クリック時の処理をここに記述
  }

  return (
    <Interactable
      id="my-button"
      onInteract={handleClick}
      interactionText="ボタンをクリック"
    >
      <RigidBody type="fixed">
        <mesh position={[0, 1, -3]}>
          <boxGeometry args={[1, 0.3, 1]} />
          <meshStandardMaterial color="#4a9eff" />
        </mesh>
      </RigidBody>
    </Interactable>
  )
}
```

##### Interactableのプロパティ

- `id` (必須): オブジェクトの一意な識別子
- `onInteract` (必須): クリック時に呼ばれるコールバック関数。オブジェクトのIDが引数として渡されます
- `interactionText` (任意): インタラクション時に表示されるテキスト。省略時は「クリックする」が表示されます
- `enabled` (任意): インタラクションの有効/無効を切り替え。デフォルトは`true`
- `children` (必須): インタラクション可能にしたい3Dオブジェクト

##### 使用例

このテンプレートには、`src/components/InteractableButton/`に実装例が含まれています：

- クリック回数をカウント
- クリック数に応じて色が変化
- ボタンを押すアニメーション効果

詳細な実装は`src/components/InteractableButton/index.tsx`と`src/World.tsx`を参照してください。

#### インスタンス全体で同期される状態管理（useInstanceState）

`@xrift/world-components`の`useInstanceState`フックを使用すると、同じワールドインスタンス内の全ユーザー間で状態を同期できます。これにより、マルチユーザー対応のインタラクティブなワールドを簡単に作成できます。

```typescript
import { useInstanceState } from '@xrift/world-components'

function GlobalCounter() {
  // インスタンス全体で同期されるカウンター
  const [count, setCount] = useInstanceState<number>('global-counter', 0)

  const handleClick = () => {
    setCount((prev) => prev + 1)
  }

  return (
    <Interactable id="counter" onInteract={handleClick}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={count > 5 ? 'green' : 'blue'} />
      </mesh>
    </Interactable>
  )
}
```

##### useInstanceStateの使い方

```typescript
const [state, setState] = useInstanceState<T>(stateId, initialState)
```

**パラメータ:**
- `stateId`: 状態の一意識別子（インスタンス内で一意である必要があります）
- `initialState`: 初期状態値
- `setState`: 状態を更新する関数（Reactの`useState`と同じAPI）

**更新パターン:**
```typescript
// 直接値を設定
setState({ enabled: true })

// 関数型アップデート
setState(prev => ({ enabled: !prev.enabled }))
```

**重要な注意点:**
- 状態はJSON形式でシリアライズ可能である必要があります
- プラットフォーム側がWebSocketを通じて全クライアント間の同期を実現します
- ローカル開発環境（Context未設定時）では通常の`useState`として動作します

##### ローカルステートとグローバルステートの使い分け

このテンプレートの`InteractableButton`コンポーネントは、`useGlobalState`プロパティで動作を切り替えられる実装例を提供しています：

```typescript
// ローカルステート（各ユーザーごとに独立）
<InteractableButton
  id="local-button"
  label="ローカル"
  useGlobalState={false}
/>

// グローバルステート（全ユーザー間で同期）
<InteractableButton
  id="global-button"
  label="グローバル"
  useGlobalState={true}
/>
```

実装の詳細は`src/components/InteractableButton/index.tsx`を参照してください。

## .xriftディレクトリについて

`.xrift/`ディレクトリには、ワールドの設定情報（ワールドIDなど）がローカル環境固有の情報として保存されます。このディレクトリは`.gitignore`に含まれており、リポジトリにコミットされません。

```.xrift/
└── world.json  # ワールドID、名前などの情報
```

このファイルは、XRift CLIでワールドをデプロイする際に自動的に作成・更新されます。開発者が手動で編集する必要はありません。

### 6. ビルド

```bash
npm run build
```

Module Federation形式でビルドされ、XRiftプラットフォームで読み込み可能な形式で `dist/` に出力されます。

## 開発コマンド

```bash
# 開発サーバー起動（ホットリロード有効）
npm run dev

# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# TypeScript型チェック
npm run typecheck
```

## 技術スタック

- **React**: 19.x
- **Three.js**: 0.176.x
- **@react-three/fiber**: 9.3.x
- **@react-three/rapier**: 2.1.x（物理エンジン）
- **@react-three/drei**: 10.7.x（Three.js用ヘルパー）
- **TypeScript**: 5.x
- **Vite**: 6.x（ビルドツール）

## プロジェクト設定（xrift.json）

プロジェクトルートの`xrift.json`で、XRift CLIの動作をカスタマイズできます。

### 設定例

```json
{
  "world": {
    "distDir": "./dist",
    "title": "サンプルワールド",
    "description": "React Three FiberとRapierで作られたサンプルワールドです",
    "thumbnailPath": "thumbnail.png",
    "buildCommand": "npm run build",
    "ignore": [
      "**/.DS_Store",
      "**/Thumbs.db",
      "**/*.js.map",
      "**/.gitkeep",
      "**/index.html"
    ]
  }
}
```

### 設定項目

- `distDir` (必須): アップロードするビルド済みファイルが格納されているディレクトリ
- `title` (任意): ワールドのタイトル（プロンプトのデフォルト値になります）
- `description` (任意): ワールドの説明（プロンプトのデフォルト値になります）
- `thumbnailPath` (任意): `distDir`内のサムネイル画像の相対パス（例: `thumbnail.png`）
- `buildCommand` (任意): アップロード前に自動実行するビルドコマンド
- `ignore` (任意): アップロード時に除外するファイルパターン（glob形式）

### メリット

#### buildCommand
ユーザーがビルド忘れをしなくなり、`xrift upload world`だけでビルド→アップロードが完了します。

#### title/description
初回アップロード時のプロンプトにデフォルト値が表示されるため、テンプレートをそのまま使う場合でも適切なタイトルが設定されます。

#### thumbnailPath
サムネイル画像がフロントエンドのワールド一覧に表示され、ビジュアル的に分かりやすくなります。

#### ignore
不要なファイル（システムファイル、source mapなど）を自動的に除外することで、アップロード容量を削減し、デプロイを高速化します。デフォルトで推奨パターンが設定されているため、ユーザーは何も設定せずに最適化されたアップロードが可能です。

## ワールドの公開

XRiftプラットフォームでワールドを公開する方法については、[XRift公式ドキュメント](https://github.com/WebXR-JP/xrift-cli)を参照してください。

## サポート

- Issues: [GitHub Issues](https://github.com/WebXR-JP/xrift-world-template/issues)
- XRift CLI: [xrift-cli repository](https://github.com/WebXR-JP/xrift-cli)

## ライセンス

MIT
