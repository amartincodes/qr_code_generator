import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "tests/**/*"],
      rollupTypes: true
    })
  ],
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
