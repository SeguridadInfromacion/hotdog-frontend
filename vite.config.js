import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    // Nada incrustado como data: URI, para poder usar una CSP estricta (font-src 'self').
    assetsInlineLimit: 0,
  },
  server: {
    // En desarrollo, la API es el gateway local (certificado autofirmado).
    proxy: {
      '/api': { target: 'https://localhost:8443', secure: false, changeOrigin: true },
    },
  },
})
