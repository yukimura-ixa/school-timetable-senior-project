import { defineConfig } from "vitest/config";
import baseConfig, { TEST_PATH_IGNORE_PATTERNS } from "./vitest.config";

const moeExcludePatterns = TEST_PATH_IGNORE_PATTERNS.filter(
  (pattern) => pattern !== "**/__test__/moe-standards/**",
);

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    exclude: moeExcludePatterns,
  },
});
