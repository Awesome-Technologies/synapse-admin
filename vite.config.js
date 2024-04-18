import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vitePluginVersionMark } from "vite-plugin-version-mark";

export default defineConfig({
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
