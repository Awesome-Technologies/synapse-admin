import { vitePluginVersionMark } from "vite-plugin-version-mark";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    vitePluginVersionMark({
      command: "git describe --tags",
      ifMeta: true,
      ifLog: true,
      ifGlobal: true,
    }),
  ],
});
