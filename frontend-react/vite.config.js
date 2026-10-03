import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function syncBuildOutputsPlugin() {
  return {
    name: 'sync-build-outputs',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      if (!fs.existsSync(distDir)) return

      const targets = [
        path.resolve(__dirname, '../backend-dotnet/HaciendaApi/wwwroot'),
        path.resolve(__dirname, '../frontend-php/dist'),
        path.resolve(__dirname, '../dist'),
      ]

      for (const target of targets) {
        try {
          fs.mkdirSync(target, { recursive: true })
          fs.cpSync(distDir, target, { recursive: true, force: true })
        } catch {
          // ignore copy errors in restricted cloud containers
        }
      }

      // Also copy index.html and assets to repo root for GitHub Pages
      try {
        const rootDir = path.resolve(__dirname, '..')
        fs.cpSync(distDir, rootDir, { recursive: true, force: true })
      } catch {
        // ignore
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), syncBuildOutputsPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5080',
        changeOrigin: true,
      },
    },
  },
})
