import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import pkg from './package.json' assert { type: 'json' }

function getGitShortSha(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

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
    __APP_GIT_SHA__: JSON.stringify(getGitShortSha()),
  },
}))