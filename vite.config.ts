import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'jotai',
      '@supabase/supabase-js',
      'chart.js',
      'react-chartjs-2',
      'date-fns',
      'react-big-calendar',
      'sonner'
    ]
  }
});