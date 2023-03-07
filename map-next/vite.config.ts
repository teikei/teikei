/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/common/setupTests.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src/"),
    },
  },
});
