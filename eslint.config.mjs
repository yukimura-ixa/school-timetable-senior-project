// Flat ESLint config for Next.js 16 with TypeScript (ESLint v9)
// Uses official Next.js ESLint plugin with flat config format
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const eslintConfig = [
  // Ignore non-source folders (matches .gitignore patterns)
  {
    ignores: [
      // Dependencies
      "node_modules/**",
      ".pnp/**",
      ".pnp.js",
      
      // Testing
      "coverage/**",
      "test-results/**",
      "playwright-report/**",
      "playwright/.cache/**",
      
      // Next.js
      ".next/**",
      "out/**",
      
      // Production
      "build/**",
      
      // TypeScript
      "*.tsbuildinfo",
      "next-env.d.ts",
      
      // Prisma generated client
      "prisma/generated/**",
      
      // Test directories (excluded from linting)
      "e2e/**",
      "__test__/**",
      
      // Legacy/temporary files
      "legacy/**",
      "public/raw-data/**",
      
      // Build artifacts
      ".swc/**",
      
      // IDE
      ".idea/**",
      ".vscode/**",
    ],
  },

  // Base JS recommendations
  js.configs.recommended,

  // TypeScript recommended (type-checked) - applied before Next.js configs
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
  })),

  // Next.js core web vitals + TypeScript rules
  ...nextVitals,
  ...nextTs,

  // TypeScript-specific configuration
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    languageOptions: {
      parserOptions: {
        project: true, // Auto-detect nearest tsconfig.json
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript rules
      "no-unused-vars": "off", // handled by TS
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error", // Phase 1: Prevent 'any' type regressions
      
      // Disable unsafe type rules for Prisma transaction callbacks
      // Prisma's transaction API uses complex generics that don't fully propagate types
      // These are false positives - the operations are type-safe at runtime
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },

  // JavaScript files (config files, etc.) - disable TS rules
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },

  // All files - general rules
  {
    rules: {
      // Next.js specific rules (already included via nextVitals/nextTs, but can be customized)
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",

      // General code quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "smart"],
    },
  },
  // Prettier must be last to override formatting rules
  eslintConfigPrettier,
];

export default eslintConfig;
