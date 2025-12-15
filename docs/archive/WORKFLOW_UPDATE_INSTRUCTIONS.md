# Manual Update Instructions for .github/workflows/e2e-tests.yml

# Use your IDE's Find & Replace (Ctrl+H in most editors)

## Step 1: Replace hardcoded AUTH_SECRET with GitHub secret

Find: AUTH_SECRET=ci-test-secret-e2e-playwright
Replace: BETTER_AUTH_SECRET=${{ secrets.AUTH_SECRET }}

## Step 2: Add BETTER_AUTH_URL after each BETTER_AUTH_SECRET in env files

After line 94 (BETTER_AUTH_SECRET=${{ secrets.AUTH_SECRET }}), add new line:
          BETTER_AUTH_URL=${{ vars.BETTER_AUTH_URL }}

After line 106 (BETTER_AUTH_SECRET=${{ secrets.AUTH_SECRET }}), add new line:
          BETTER_AUTH_URL=${{ vars.BETTER_AUTH_URL }}

## Step 3: Replace in YAML env blocks (with colon syntax)

Find: AUTH_SECRET: ci-test-secret-e2e-playwright
Replace: BETTER_AUTH_SECRET: ${{ secrets.AUTH_SECRET }}

## Step 4: Add BETTER_AUTH_URL in each env: block

After each "BETTER_AUTH_SECRET: ${{ secrets.AUTH_SECRET }}" line in env: blocks, add:
BETTER_AUTH_URL: ${{ vars.BETTER_AUTH_URL }}

This should be in approximately 4 places: seed, build, server start, and test run

## Step 5: Update comment

Find: # Better-auth requires AUTH_SECRET for session
Replace: # Better-auth requires BETTER_AUTH_SECRET and BETTER_AUTH_URL for session

## Verification

After edits, verify 6 locations have both vars:

1. .env.test file (lines ~94-95)
2. .env.test.local file (lines ~106-107)
3. Seed env block (lines ~138-140)
4. Build env block (lines ~144-146)
5. Server start env block (lines ~156-158)
6. Test run env block (lines ~179-181)

Run: git diff .github/workflows/e2e-tests.yml
Should show +18 lines, -6 lines (net +12)
