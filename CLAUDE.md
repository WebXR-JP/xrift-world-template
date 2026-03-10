# XRift World Template - AI ガイド

## 詳細な API ドキュメントの取得

詳細な API リファレンス・コードテンプレート・型定義は以下のコマンドで取得できます：

```bash
npx skills add WebXR-JP/xrift-skills
```

---

## 最重要ルール（必ず守ること）

1. **アセット読み込みは必ず `useXRift()` の `baseUrl` を使用**
2. **アセットファイルは `public/` ディレクトリに配置**
3. **`baseUrl` は末尾に `/` を含むため、`${baseUrl}path` で結合**（`${baseUrl}/path` は NG）

```typescript
// ✅ 正しい
const { baseUrl } = useXRift()
const model = useGLTF(`${baseUrl}robot.glb`)

// ❌ 間違い
const model = useGLTF('/robot.glb')           // 絶対パス NG
const model = useGLTF(`${baseUrl}/robot.glb`) // 余分な / NG
```

---

## shared 依存として利用可能なパッケージ

Module Federation により、以下のパッケージはワールドチャンクにインライン化されず shared チャンクとして分離されます：

- `react`, `react-dom`, `react/jsx-runtime`, `react-dom/client`
- `three`, `three/addons`
- `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`
- `@xrift/world-components`

**`three/addons` について**: DRACOLoader 等の Three.js アドオンは `three/addons` から import してください。`three/examples/jsm` からの直接 import はワールドチャンクにインライン化され、`@xrift/code-security` で `new Worker()` が critical 違反として検出される場合があります。

```typescript
// ✅ 正しい（shared チャンクとして分離される）
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

// ❌ 間違い（インライン化されセキュリティ違反の可能性）
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
```

---

## プロジェクト概要

- **用途**: XRiftプラットフォーム用WebXRワールド
- **技術**: React Three Fiber + Rapier物理エンジン + Module Federation
- **動作**: CDNにアップロード後、フロントエンドから動的ロード

---

## プロジェクト構造

```
xrift-world-template/
├── public/              # アセットファイル（直接配置、サブディレクトリ不要）
├── src/
│   ├── components/      # 3Dコンポーネント
│   ├── World.tsx        # メインワールドコンポーネント
│   ├── dev.tsx          # 開発用エントリーポイント
│   ├── index.tsx        # 本番用エクスポート
│   └── constants.ts     # 定数定義
├── .triplex/            # Triplex（3Dエディタ）設定
├── xrift.json           # XRift CLI設定
├── vite.config.ts       # ビルド設定（Module Federation）
└── package.json
```

---

## コマンドリファレンス

```bash
# 開発
npm run dev        # 開発サーバー起動 (http://localhost:5173)
npm run build      # 本番ビルド
npm run typecheck  # 型チェック

# XRift CLI
xrift login        # 認証
xrift create world # 新規ワールドプロジェクト作成
xrift upload       # アップロード（xrift.json から自動判定）
xrift whoami       # ログインユーザー確認
xrift logout       # ログアウト
```

---

## 実装例の参照先

- **GLBモデル**: `src/components/Duck/index.tsx`
- **Skybox**: `src/components/Skybox/index.tsx`
- **アニメーション**: `src/components/RotatingObject/index.tsx`
- **インタラクション**: `src/components/InteractableButton/index.tsx`
- **ユーザー追跡**: `src/components/RemoteUserHUDs/index.tsx`
- **テレポート**: `src/components/TeleportPortal/index.tsx`
- **メインワールド**: `src/World.tsx`
