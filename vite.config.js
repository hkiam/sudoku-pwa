import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'node:fs'

const VERSION = '1.1.0'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'write-preview-index',
      closeBundle() {
        writeFileSync('dist/index.html', `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sudoku PWA</title>
    <meta name="description" content="Classic Sudoku with Highscore - A Progressive Web App" />
    <link rel="manifest" href="./manifest.json" />
    <meta name="theme-color" content="#7A4A24" />
    <link rel="apple-touch-icon" href="./apple-icon.png" />
    <script type="module" crossorigin src="./assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="./assets/index.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`)
      }
    }
  ],
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
      input: 'src/main.jsx',
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/chunk-[hash].js',
        assetFileNames: (assetInfo) => {
          const assetName = assetInfo.names?.[0] || ''
          if (assetName.endsWith('.css')) return 'assets/index.css'
          return 'assets/[name].[ext]'
        }
      }
    }
  },
  define: {
    'import.meta.env.VERSION': JSON.stringify(VERSION)
  }
})
