import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    target: [ 'es2020' ],
    build: { chunkSizeWarningLimit: 1600, },
  },
  css: {
    include: ['./src/app.css']
  },
})
