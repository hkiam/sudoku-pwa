import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const VERSION = '1.1.0'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/index-[hash].js`,
        chunkFileNames: `assets/chunk-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  define: {
    'import.meta.env.VERSION': JSON.stringify(VERSION)
  }
})
