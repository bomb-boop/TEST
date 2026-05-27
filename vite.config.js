import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // 로컬 개발 시 /api 요청을 Vercel 배포본으로 프록시
    proxy: {
      '/api': {
        target: 'https://test-wheat-six-86.vercel.app',
        changeOrigin: true,
      }
    }
  }
})
