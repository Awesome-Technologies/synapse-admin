import { vitePluginVersionMark } from "vite-plugin-version-mark";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    chunkSizeWarningLimit: 1500,
  },
  plugins: [
    react(),
    vitePluginVersionMark({
      command: "git describe --tags",
      ifMeta: true,
      ifLog: true,
      ifGlobal: true,
    }),
  ],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: "./src/vitest.setup.ts",
  },
});
