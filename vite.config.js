import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for the mobile-first study companion PWA.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose on the local network so it can be opened on a phone
    port: 5173,
  },
})
