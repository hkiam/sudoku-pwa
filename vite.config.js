import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const GITHUB_PAGES = process.env.GITHUB_PAGES || false;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  base: GITHUB_PAGES ? '/sudoku-pwa/' : '/'
})