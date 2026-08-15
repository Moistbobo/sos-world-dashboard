import { defineConfig, loadEnv } from 'vite'
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

function preloadRouteChunk(chunkPrefix: string) {
  return {
    name: `preload-${chunkPrefix}`,
    apply: 'build' as const,
    transformIndexHtml: {
      order: 'post' as const,
      handler(html: string, ctx: { bundle?: Record<string, unknown> }) {
        const file = Object.keys(ctx.bundle ?? {}).find(
          (name) => name.startsWith(`assets/${chunkPrefix}-`) && name.endsWith('.js'),
        );
        if (!file) return html;
        return html.replace(
          '<script type="module"',
          `<link rel="modulepreload" crossorigin href="/${file}">\n    <script type="module"`,
        );
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const compilerEnabled = env.VITE_REACT_COMPILER !== 'false'
  const benchmarkProfiler = env.VITE_BENCHMARK_PROFILER === 'true'

  return {
    plugins: [react({
      babel: {
        plugins: compilerEnabled ? ['babel-plugin-react-compiler'] : [],
      },
    }), preloadRouteChunk('worlds')],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'shared-ui',
                test: /src\/components\/(save-to-list-dialog|tag-badge|list-icon)\/|node_modules\/lucide-react/,
              },
            ],
          },
        },
      },
    },
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
