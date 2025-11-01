import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    port: 3000
  }
  // TODO check if this is needed
  // resolve: {
  //   alias: {
  //     '@': path.resolve(__dirname, './src')
  //   }
  // },
  // build: {
  //   rollupOptions: {
  //     output: [
  //       {
  //         format: 'es',
  //         dir: 'dist',
  //         entryFileNames: 'main.mjs'
  //       },
  //       {
  //         format: 'iife',
  //         dir: 'dist',
  //         entryFileNames: 'main.js'
  //       }
  //     ]
  //   }
  // },
  // optimizeDeps: {
  //   esbuildOptions: {
  //     define: {
  //       global: 'globalThis'
  //     }
  //   }
  // }
})
