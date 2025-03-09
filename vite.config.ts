import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    https: false, // Development'ta HTTPS'i devre dışı bırak
    host: true, // Tüm network interface'lerine izin ver
  },
  preview: {
    https: false, // Preview'da da HTTPS'i devre dışı bırak
  }
});