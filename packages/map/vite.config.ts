import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      output: [
        {
          format: 'es',
          dir: 'dist',
          entryFileNames: 'main.mjs'
        },
        {
          format: 'iife',
          dir: 'dist',
          entryFileNames: 'main.js'
        }
      ]
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})
