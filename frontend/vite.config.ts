import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 后端地址：优先使用本地后端，未启动时使用线上 Railway 后端
const API_TARGET = process.env.VITE_API_TARGET || 'https://hotel-management-production-wayne.up.railway.app'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
      '/socket.io': {
        target: API_TARGET,
        ws: true,
      },
    },
  },
})
