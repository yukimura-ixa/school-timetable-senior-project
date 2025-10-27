# Linting Migration for Next.js 16

Next.js 16 removes the `next lint` command. Projects should run ESLint directly via the ESLint CLI.

## What changed

- `next lint` was removed in Next.js 16.
- Linting is no longer tied to the Next.js build; run it as a separate step (locally and in CI).
- Editor integrations (VS Code ESLint extension) remain the primary way to see warnings in dev.

## Project setup (this repo)

- Scripts in `package.json`:
  - `pnpm lint` → runs ESLint CLI
  - `pnpm lint:eslint` → ESLint with strict reporting (max-warnings=0)
  - `pnpm lint:fix` → ESLint with `--fix`
  - `pnpm format` → Prettier formatting

- Config: `eslint.config.mjs` (flat config for ESLint v9) using `typescript-eslint` recommended (type-checked). Non-source folders (e2e, prisma, __test__, etc.) are ignored for signal-to-noise.

## Local usage

```pwsh
pnpm lint
pnpm lint:fix
pnpm format
```

## CI example (GitHub Actions)

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint_build_test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm i --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
```

## Notes

- If you previously relied on `next lint`, the official codemod is: `npx @next/codemod@canary next-lint-to-eslint-cli`.
- We already migrated to ESLint CLI in this project; running the codemod is optional.
- Consider gradually reducing lint noise across the codebase now that the runner is reliable across platforms.
