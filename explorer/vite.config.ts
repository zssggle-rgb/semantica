import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { cpSync, createReadStream, existsSync } from 'node:fs'

const apiTarget = process.env.VITE_EXPLORER_API_TARGET ?? 'http://127.0.0.1:8000'
const wsTarget = process.env.VITE_EXPLORER_WS_TARGET ?? apiTarget.replace(/^http/, 'ws')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    {
      name: 'bundled-monaco-resources',
      configureServer(server) {
        const resourceRoot = path.resolve(__dirname, 'node_modules/monaco-editor/min/vs')
        server.middlewares.use('/assets/monaco/vs', (request, response, next) => {
          let resourcePath = path.resolve(resourceRoot, `.${new URL(request.url ?? '/', 'http://localhost').pathname}`)
          // Monaco 0.55.1 ships this named AMD module with a doubled extension.
          if (resourcePath === path.join(resourceRoot, 'nls.messages.zh-cn.js')) resourcePath += '.js'
          if (!resourcePath.startsWith(`${resourceRoot}${path.sep}`) || !existsSync(resourcePath)) {
            next()
            return
          }
          const extension = path.extname(resourcePath)
          response.setHeader('Content-Type', extension === '.js' ? 'text/javascript' : extension === '.css' ? 'text/css' : 'application/octet-stream')
          createReadStream(resourcePath).on('error', next).pipe(response)
        })
      },
      closeBundle() {
        cpSync(
          path.resolve(__dirname, 'node_modules/monaco-editor/min/vs'),
          path.resolve(__dirname, '../semantica/static/assets/monaco/vs'),
          { recursive: true },
        )
        cpSync(
          path.resolve(__dirname, 'node_modules/monaco-editor/min/vs/nls.messages.zh-cn.js.js'),
          path.resolve(__dirname, '../semantica/static/assets/monaco/vs/nls.messages.zh-cn.js'),
        )
      },
    },
  ],
 
  base: '/',
  build: {
    outDir: path.resolve(__dirname, '../semantica/static'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 650,
    // Explicit target avoids esbuild attempting to lower syntax that all
    // modern browsers already support natively, which breaks with the
    // esbuild >=0.28 override when running under Vite 6 on Linux CI.
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\', '/')

          if (!normalizedId.includes('node_modules')) {
            return undefined
          }

          if (
            normalizedId.includes('/node_modules/sigma/') ||
            normalizedId.includes('/node_modules/graphology/') ||
            normalizedId.includes('/node_modules/graphology-layout-forceatlas2/')
          ) {
            return 'graph-vendor'
          }

          if (
            normalizedId.includes('/node_modules/vis-data/') ||
            normalizedId.includes('/node_modules/vis-timeline/')
          ) {
            return 'timeline-vendor'
          }

          if (normalizedId.includes('/node_modules/@tanstack/react-query/')) {
            return 'query-vendor'
          }

          return undefined
        },
      },
    },
  },
  optimizeDeps: {
    // Keep dependency pre-bundling aligned with the production build target.
    // esbuild >=0.28 no longer lowers destructuring for Vite's default target.
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/ws': {
        target: wsTarget,
        ws: true,
      },
    },
  },
})
