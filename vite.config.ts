import path from 'node:path';
import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
    // Keep the AI Studio HMR compatibility switch without invalid WatchOptions.
    hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
  },
});
