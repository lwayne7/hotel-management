/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 后端地址：
// - 开发环境默认指向本地 NestJS 后端（http://localhost:3000）
// - 如需连线上环境，可通过 VITE_API_TARGET 显式覆盖
const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
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
