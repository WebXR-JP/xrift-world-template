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

### 4. 開発サーバーを起動

```bash
cd my-world
npm install
npm run dev
```

### 5. ビルド

```bash
npm run build
```

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

## ドキュメント

ワールド開発の詳細（アセットの読み込み、SpawnPoint、Interactable、useInstanceStateなど）については、公式ドキュメントをご覧ください。

**[docs.xrift.net](https://docs.xrift.net)**

## 関連リンク

- [xrift-world-components](https://github.com/WebXR-JP/xrift-world-components) - ワールド開発用コンポーネントライブラリ
- [xrift-cli](https://github.com/WebXR-JP/xrift-cli) - XRift CLI
- [XRift](https://xrift.net) - XRiftプラットフォーム

## サポート

- Issues: [GitHub Issues](https://github.com/WebXR-JP/xrift-world-template/issues)

## ライセンス

MIT
