import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
// @ts-expect-error
import tsconfigPaths from "vitest-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.tsx"],
    globals: true,
  },
});
