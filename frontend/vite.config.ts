import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 后端地址：优先使用本地后端，未启动时使用线上 Railway 后端
const API_TARGET = process.env.VITE_API_TARGET || 'https://hotel-management-production-wayne.up.railway.app'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('antd') || id.includes('@ant-design')) return 'vendor-antd';
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react-router')) return 'vendor-react-router';
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) return 'vendor-state';
            if (id.includes('axios') || id.includes('dayjs') || id.includes('socket.io')) return 'vendor-utils';
          }
        },
      },
    },
  },
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
