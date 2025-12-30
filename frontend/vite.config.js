import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default port for development
    host: true
  },
  preview: {
    port: process.env.PORT || 5173,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist', // Output directory for build
    sourcemap: false
  },
  css: {
    postcss: './postcss.config.js'
  }
});
