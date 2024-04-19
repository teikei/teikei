import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
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
