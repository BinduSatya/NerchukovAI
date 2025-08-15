import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"), // popup UI
        background: resolve(__dirname, "src/background.js"), // background script
        content: resolve(__dirname, "src/content.js"), // content script
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Ensures the output file keeps its name
          if (chunkInfo.name === "content") return "content.js";
          if (chunkInfo.name === "background") return "background.js";
          return "assets/[name].js";
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
