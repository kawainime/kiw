import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Izinkan host VPS kamu
    allowedHosts: ['165.22.109.40', 'jasaotp.rootsec.co.id'],
    host: '0.0.0.0', // Agar bisa diakses dari luar saat mode dev
    // Proxy untuk development (opsional, mempermudah tes lokal)
    proxy: {
      '/api': {
        target: 'http://jasaotp.rootsec.co.id:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Pastikan hasil build masuk ke folder dist
    outDir: 'dist',
    emptyOutDir: true,
  }
})
