import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    chunkSizeWarningLimit: 1500,
  },
  plugins: [
    react(),
  ],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: "./src/vitest.setup.ts",
  },
});
