import { defineConfig } from 'vite';
import stylex from '@stylexjs/unplugin';
export default defineConfig({
  plugins: [stylex.vite({ dev: false, runtimeInjection: false, useCSSLayers: false })],
  build: { rollupOptions: { input: '/Users/mrbobo/WebstormProjects/sos-world-dashboard-worktrees/vrc-world-dashboard-270/scripts/probe/main.ts' } },
});
