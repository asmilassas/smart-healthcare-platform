import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '^/api/auth(/.*)?$': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '^/api/patients(/.*)?$': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false,
      },
      '^/api/doctors(/.*)?$': {
        target: 'http://127.0.0.1:5002',
        changeOrigin: true,
        secure: false,
      },
      '^/api/appointments(/.*)?$': {
        target: 'http://127.0.0.1:5003',
        changeOrigin: true,
        secure: false,
      },
      '^/api/ai(/.*)?$': {
        target: 'http://127.0.0.1:8084',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
