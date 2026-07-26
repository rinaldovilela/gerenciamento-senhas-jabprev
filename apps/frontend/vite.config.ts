import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@shared': path.resolve(__dirname, './src/shared'),
          '@features': path.resolve(__dirname, './src/features'),
          '@lib': path.resolve(__dirname, './src/lib'),
          '@config': path.resolve(__dirname, './src/config'),
        }
      },
      build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks(id) {
              const normalizedId = id.replace(/\\/g, '/');
              if (normalizedId.includes('node_modules/echarts')) {
                return 'vendor-echarts';
              }
              if (normalizedId.includes('node_modules/lucide-react')) {
                return 'vendor-lucide';
              }
              if (normalizedId.includes('node_modules/jspdf') || normalizedId.includes('node_modules/html2canvas') || normalizedId.includes('node_modules/jspdf-autotable')) {
                return 'vendor-pdf';
              }
              if (normalizedId.includes('node_modules/react') || normalizedId.includes('node_modules/react-dom') || normalizedId.includes('node_modules/framer-motion')) {
                return 'vendor-react';
              }
              if (normalizedId.includes('node_modules/@supabase')) {
                return 'vendor-supabase';
              }
            }
          }
        }
      }
    };
});
