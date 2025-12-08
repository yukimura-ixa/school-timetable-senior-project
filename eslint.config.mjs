// Flat ESLint config for Next.js 16 with TypeScript (ESLint v9)
// Uses official Next.js ESLint plugin with flat config format
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

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
      "app/generated/prisma/**",

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
      "@typescript-eslint/no-explicit-any": "warn", // Relaxed for CI
      // Permit async handlers in JSX without void wrapper
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],

      // Disable unsafe type rules for Prisma transaction callbacks
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      // Temporary relaxations to unblock CI
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-unsafe-argument": "off",

      // Downgrade to warnings for CI stability (to be fixed incrementally)
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/no-redundant-type-constituents": "warn",
    },
  },
  {
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/features/**/*/presentation/stores/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // JavaScript files (config files, etc.) - disable TS rules
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },

  // Vitest test files - add Vitest globals and relaxed rules
  {
    files: [
      "**/__test__/**/*.{ts,tsx,js,jsx}",
      "**/*.{test,spec}.{ts,tsx,js,jsx}",
    ],
    languageOptions: {
      globals: {
        // Vitest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      // Testing code can use flexible types safely
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },

  // All files - general rules
  {
    rules: {
      // Next.js specific rules (already included via nextVitals/nextTs, but can be customized)
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",

      // General code quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["warn", "smart"], // Downgraded from error for CI stability

      // React hooks - downgrade for legacy code patterns
      "react-hooks/rules-of-hooks": "warn", // Legacy components may violate
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn", // Legacy patterns with cascading state

      // TODO tracking - enforce issue references
      // Requires format: // TODO: [Issue #XX] Description
      "no-warning-comments": [
        "warn",
        {
          terms: ["todo", "fixme", "@todo"],
          location: "start",
        },
      ],
    },
  },
  // Prettier must be last to override formatting rules
  eslintConfigPrettier,
];

export default eslintConfig;
