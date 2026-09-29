import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Served from a sub-path on GitHub Pages (VITE_BASE=/artistry/); root everywhere else.
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: { port: 5173, open: false },
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks cache across deploys; app code stays small.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
