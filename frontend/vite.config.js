import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'solana': ['@solana/web3.js', '@coral-xyz/anchor'],
          'monaco': ['@monaco-editor/react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    esbuildOptions:{
      define: {
        global:'globalThis',
    },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
})
