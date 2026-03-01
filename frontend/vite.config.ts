import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ['src/styles'],
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:7860',
      '/openapi.json': 'http://localhost:7860',
    },
  },
})
