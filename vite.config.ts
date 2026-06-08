import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import sitemapPlugin from './vite-sitemap-plugin';

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss({
      scan: {
        include: ['src/**/*.{html,js,ts,jsx,tsx}', 'index.html'],
        exclude: ['.opencode.backup/**', 'node_modules/**', 'dist/**']
      }
    }),
    sitemapPlugin({
      baseUrl: 'https://jjk-stat-clash.vercel.app',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
