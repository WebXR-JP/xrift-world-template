import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import federation from '@originjs/vite-plugin-federation'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { xriftDev } from '@xrift/sdk/vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // npm run dev:vr（--mode https）のときだけ HTTPS にする。ヘッドセットから LAN 越しに開くと WebXR は HTTPS が要る
    mode === 'https' ? basicSsl() : null,
    // <Item itemId> をローカルでも本番と同じバンドルで動かすための中継（要 xrift login）
    xriftDev(),
    dts({
      insertTypesEntry: true,
    }),
    federation({
      name: 'xrift_world_template',
      filename: 'remoteEntry.js',
      exposes: {
        './World': './src/index.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '*',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '*',
        },
        'react-dom/client': {
          singleton: true,
        },
        'react/jsx-runtime': {
          singleton: true,
        },
        three: {
          singleton: true,
          requiredVersion: '*',
        },
        'three/addons/loaders/GLTFLoader.js': {
          singleton: true,
        },
        'three/addons/loaders/DRACOLoader.js': {
          singleton: true,
        },
        'three/addons/loaders/KTX2Loader.js': {
          singleton: true,
        },
        '@react-three/fiber': {
          singleton: true,
          requiredVersion: '*',
        },
        '@react-three/rapier': {
          singleton: true,
          requiredVersion: '*',
        },
        '@react-three/drei': {
          singleton: true,
          requiredVersion: '*',
        },
        '@react-three/uikit': {
          singleton: true,
          requiredVersion: '*',
        },
        '@pmndrs/uikit': {
          singleton: true,
          requiredVersion: '*',
        },
        '@xrift/world-components': {
          singleton: true,
          requiredVersion: '*',
        },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    assetsDir: '',
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
}))
