import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { PreRenderedAsset } from 'rollup'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    lib: {
      entry: './src/main.tsx',
      formats: ['cjs', 'es'],
      fileName: (format) => (format === 'cjs' ? 'main.js' : 'main.esm.js')
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo: PreRenderedAsset) => {
          if (assetInfo.name === 'style.css') {
            return 'main.css'
          }
          return assetInfo.name ?? ''
        }
      }
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
