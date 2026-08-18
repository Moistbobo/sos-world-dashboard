import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import stylex from '@stylexjs/unplugin'
import { execSync } from 'node:child_process'
import pkg from './package.json' assert { type: 'json' }

function getGitShortSha(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const compilerEnabled = env.VITE_REACT_COMPILER !== 'false'
  const benchmarkProfiler = env.VITE_BENCHMARK_PROFILER === 'true'

  return {
    plugins: [
      stylex.vite({
        dev: mode === 'development' || mode === 'test',
        runtimeInjection: mode === 'development' || mode === 'test',
        useCSSLayers: false,
      }),
      react({
        babel: {
          plugins: compilerEnabled ? ['babel-plugin-react-compiler'] : [],
        },
      }),
    ],
    resolve: {
      alias: benchmarkProfiler
        ? { 'react-dom/client': 'react-dom/profiling' }
        : undefined,
    },
    server: {
      port: 5173,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      exclude: ['node_modules', '.worktrees/**', '.opencode/**', 'e2e/**'],
    },
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __APP_MODE__: JSON.stringify(mode),
      __APP_GIT_SHA__: JSON.stringify(getGitShortSha()),
    },
  }
})
