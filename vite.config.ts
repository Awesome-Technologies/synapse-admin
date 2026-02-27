import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    basicSsl(),
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
