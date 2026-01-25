import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
  ],
  server: {
    host: true,
  },
  base: './',
  build: {
    chunkSizeWarningLimit: 1500,
    sourcemap: mode === 'development',
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: "./src/vitest.setup.ts",
  },
  ssr: {
    noExternal: ['react-dropzone', 'react-admin', 'ra-ui-materialui'],
  },
}));
