import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        cli: resolve(__dirname, "src/cli.ts")
      },
      formats: ["es"]
    },
    outDir: "dist",
    rollupOptions: {
      external: ["encoding-japanese", "pngjs", "fs", "path"]
    }
  }
});
