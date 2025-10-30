// Flat ESLint config to make linting work cross-platform (ESLint v9)
// Minimal TypeScript + JS config to avoid Next CLI Windows issues
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  // Ignore non-source folders
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'coverage/**',
      'e2e/**',
      '__test__/**',
      'legacy/**',
      'prisma/**',
      'playwright-report*/**',
      'test-results/**',
    ],
  },

  // Base JS recommendations
  js.configs.recommended,

  // TypeScript recommended (type-checked)
  ...tseslint.configs.recommendedTypeChecked,

  // Project parser options and a few sensible rules
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Keep it minimal to avoid churn; can be tightened later
      'no-unused-vars': 'off', // handled by TS
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error', // Phase 1: Prevent 'any' type regressions
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
    },
  },
];
