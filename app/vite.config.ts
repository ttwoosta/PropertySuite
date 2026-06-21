import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The design-system bundle (src/ds-vendor/ds_bundle.js) is a precompiled IIFE
// that references a global `React` and writes its components onto
// `window.MaintenanceSchedulerDesignSystem_02479c`. We deliberately do NOT let
// esbuild rewrite it — it's loaded for side effects only (see src/ds-vendor/ds.ts).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    // The `icons` chunk is large because lucide-react is imported as a namespace
    // (src/lib/icon.tsx) so any kebab-case icon name resolves at runtime — a
    // deliberate trade for this demo. Split out, it's cached independently.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/ai'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
