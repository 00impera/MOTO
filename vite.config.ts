import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'pino-pretty': '/dev/null',
      'encoding': '/dev/null',
    }
  },
  optimizeDeps: {
    exclude: ['pino-pretty']
  }
})
