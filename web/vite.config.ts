import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5555,
    proxy: {
      '/api': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
