import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync, existsSync, mkdirSync } from "fs";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "service-worker": resolve(__dirname, "src/background/service-worker.ts"),
        popup: resolve(__dirname, "src/popup/popup.ts"),
        options: resolve(__dirname, "src/options/options.ts"),
        content: resolve(__dirname, "src/content/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        format: "es",
      },
    },
  },
  plugins: [
    {
      name: "copy-static-files",
      closeBundle() {
        if (!existsSync(resolve(__dirname, "dist"))) {
          mkdirSync(resolve(__dirname, "dist"));
        }
        
        // Copy Popup files
        copyFileSync(
          resolve(__dirname, "src/popup/popup.html"),
          resolve(__dirname, "dist/popup.html")
        );
        copyFileSync(
          resolve(__dirname, "src/popup/popup.css"),
          resolve(__dirname, "dist/popup.css")
        );
        // Copy Options file
        copyFileSync(
          resolve(__dirname, "src/options/options.html"),
          resolve(__dirname, "dist/options.html")
        );
        // Copy Content CSS file
        copyFileSync(
          resolve(__dirname, "src/content/content.css"),
          resolve(__dirname, "dist/content.css")
        );
      },
    },
  ],
});