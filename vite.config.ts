import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Automatically detect GitHub repository name (e.g. /Comercializadora-Los-Altos/)
const repoPath = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/Comercializadora-Los-Altos/';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? repoPath : './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
