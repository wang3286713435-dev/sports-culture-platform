import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'h5.zhuoyusmart.top',
      'manage.zhuoyusmart.top',
      'teacher.zhuoyusmart.top',
      'api.zhuoyusmart.top',
      'localhost',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
