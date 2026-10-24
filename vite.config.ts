import { federation } from '@module-federation/vite';
import { REMOTE_EXPOSES } from '@portal/mf-shared';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const PORT = 5175;

/**
 * Legacy remote on React 18: NOTHING is shared — it brings its own React, router and styles,
 * so the host detects a different React instance and mounts it through MF Bridge (own root).
 */
export default defineConfig({
  base: './',
  server: { port: PORT, origin: `http://localhost:${PORT}`, cors: true },
  preview: { port: PORT, cors: true },
  build: { target: 'es2023' },
  plugins: [
    react(),
    federation({
      name: 'legacy',
      filename: 'remoteEntry.js',
      manifest: true,
      dts: false,
      exposes: {
        [REMOTE_EXPOSES.RemoteRoot]: './src/exposes/RemoteRoot.tsx',
        [REMOTE_EXPOSES.RemoteBridge]: './src/exposes/RemoteBridge.tsx',
        [REMOTE_EXPOSES.runtime]: './src/exposes/runtime.ts',
        [REMOTE_EXPOSES.preload]: './src/exposes/preload.ts',
      },
      shared: {},
    }),
  ],
});
