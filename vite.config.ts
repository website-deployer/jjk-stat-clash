import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import sitemapPlugin from './vite-sitemap-plugin';

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    sitemapPlugin({
      baseUrl: 'https://jjk-stat-clash.vercel.app',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
