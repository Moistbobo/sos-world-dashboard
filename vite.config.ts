import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json' assert { type: 'json' }

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['node_modules', '.worktrees/**'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_MODE__: JSON.stringify(mode),
  },
}))