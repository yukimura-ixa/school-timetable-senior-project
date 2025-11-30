# Generate BETTER_AUTH_SECRET

This script generates a cryptographically secure random secret for better-auth configuration.

## Usage

### Generate a new secret:
```bash
node scripts/generate-auth-secret.js
```

### Add to GitHub Secrets (CI):
```bash
gh secret set BETTER_AUTH_SECRET --body "$(node scripts/generate-auth-secret.js)"
```

### Add to Vercel:
```bash
# Generate secret
node scripts/generate-auth-secret.js

# Then add via Vercel CLI or Dashboard:
vercel env add BETTER_AUTH_SECRET
# Paste the generated value when prompted
# Select: Production, Preview, Development
```

### Add to local .env.local:
```bash
echo "BETTER_AUTH_SECRET=$(node scripts/generate-auth-secret.js)" >> .env.local
```

## What is BETTER_AUTH_SECRET?

The `BETTER_AUTH_SECRET` is used by better-auth for:
- **Session cookie signing** - Prevents tampering with session data
- **Token encryption** - Secures authentication tokens
- **CSRF protection** - Validates request authenticity

⚠️ **Security Notes:**
- Never commit this secret to git
- Use different secrets for dev/staging/production
- Rotate secrets periodically (e.g., every 90 days)
- If compromised, generate a new one immediately (invalidates all sessions)

## References

- [better-auth Installation Docs](https://www.better-auth.com/docs/installation#set-environment-variables)
- [GitHub Secrets CLI](https://cli.github.com/manual/gh_secret_set)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
