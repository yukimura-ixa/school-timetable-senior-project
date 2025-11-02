# MCP Server Configuration Reference

> **Purpose**: Document all MCP (Model Context Protocol) servers available in this project  
> **Updated**: November 2, 2025

---

## Overview

This project uses multiple MCP servers to enhance GitHub Copilot's capabilities. MCP servers are installed in two ways:

1. **For Copilot Coding Agent**: Pre-installed via `.github/workflows/copilot-setup-steps.yml`
2. **For Local Development**: Configured in `.vscode/mcp.json` and `.serena/project.yml`

## MCP Server Registry

### 1. Context7 MCP ⭐ MANDATORY FIRST

**Package**: `@upstash/context7-mcp`  
**Installation**: `npx -y @upstash/context7-mcp install`  
**Environment**: Copilot (GitHub Actions)  

**Purpose**: Fetch up-to-date library documentation

**Use Cases**:
- Get official docs for Next.js, React, Prisma, MUI, Tailwind
- Resolve library IDs with `resolve-library-id`
- Fetch version-specific documentation with `get-library-docs`

**Workflow**:
```
1. resolve-library-id("next.js") → /vercel/next.js
2. get-library-docs("/vercel/next.js", topic="Server Actions")
3. Review official API patterns
4. Implement using authoritative patterns
```

**Priority**: **MANDATORY FIRST STEP** per AGENTS.md

---

### 2. Serena MCP ⭐ PRIMARY CODE TOOL

**Configuration**: `.serena/project.yml`  
**Installation**: Local only (not via workflow)  
**Environment**: Local development (VS Code)

**Purpose**: Symbol-aware code navigation and editing

**Use Cases**:
- Find symbols with `find_symbol`
- Get symbol references with `find_referencing_symbols`
- Symbol overview with `get_symbols_overview`
- Pattern search with `search_for_pattern`
- Memory management (read/write project memories)

**Key Features**:
- Token-efficient code reading (symbol-level, not file-level)
- Precise refactoring and edits
- Project memory system
- Language server integration

**Priority**: Use **BEFORE** reading full files to avoid token waste

---

### 3. Next DevTools MCP

**Package**: `next-devtools-mcp` (in package.json)  
**Installation**: `pnpm install` (project dependency)  
**Environment**: Both local and Copilot

**Purpose**: Next.js 16 diagnostics and codemods

**Use Cases**:
- Next.js 16 upgrades with `upgrade_nextjs_16`
- Cache Components setup with `enable_cache_components`
- Runtime diagnostics with `nextjs_runtime`
- Browser automation with `browser_eval`
- Next.js docs search with `nextjs_docs`

**Key Features**:
- Automated codemods for Next.js upgrades
- Real-time dev server diagnostics
- Browser-based testing integration

---

### 4. Prisma MCP

**Package**: `@prisma/mcp-server-prisma`  
**Installation**: `npm install -g @prisma/mcp-server-prisma`  
**Environment**: Copilot (GitHub Actions)

**Purpose**: Prisma schema reasoning and migrations

**Use Cases**:
- Schema introspection
- Migration planning and diffs
- Database operations
- Prisma Client generation guidance

**Key Features**:
- Understands Prisma schema relationships
- Suggests migration strategies
- Validates schema changes

---

### 5. GitHub MCP

**Package**: `@modelcontextprotocol/server-github`  
**Installation**: `npm install -g @modelcontextprotocol/server-github`  
**Environment**: Copilot (GitHub Actions)

**Purpose**: GitHub issues, PRs, and repository context

**Use Cases**:
- Read issue details
- Create and update PRs
- Comment on issues/PRs
- Search repositories and code
- List branches, commits, releases

**Key Features**:
- Full GitHub API integration
- Create issues from discovered bugs
- PR review workflows
- Repository search

---

### 6. Filesystem MCP

**Package**: `@modelcontextprotocol/server-filesystem`  
**Installation**: `npm install -g @modelcontextprotocol/server-filesystem`  
**Environment**: Copilot (GitHub Actions)

**Purpose**: File operations and workspace navigation

**Use Cases**:
- Read file contents
- Search codebase patterns
- Analyze file structure
- Directory listings

**Note**: Prefer **Serena** for code files (symbol-aware). Use Filesystem MCP for:
- Non-code files (markdown, config, etc.)
- Initial workspace exploration
- When Serena is unavailable

---

### 7. Playwright MCP

**Package**: `@playwright/mcp-server`  
**Installation**: `npm install -g @playwright/mcp-server`  
**Environment**: Copilot (GitHub Actions)

**Purpose**: E2E test generation and browser automation

**Use Cases**:
- Generate Playwright test code
- Browser automation scripts
- Page Object Model patterns
- Test fixture creation

**Key Features**:
- Understands Playwright API
- Suggests best practices for E2E tests
- Helps with selectors and assertions

---

### 8. MUI MCP

**Package**: MUI documentation server  
**Installation**: Available via Context7 MCP  
**Environment**: Copilot (via Context7)

**Purpose**: Material-UI component documentation

**Use Cases**:
- MUI component props and APIs
- DataGrid configuration
- Theme customization
- Component patterns

**Note**: Access via Context7's `get-library-docs` with MUI library IDs

---

### 9. Sentry MCP

**URL**: `https://mcp.sentry.dev/mcp/yukimura-ixa/phrasongsa-timetable`  
**Type**: HTTP  
**Configuration**: `.vscode/mcp.json`  
**Environment**: Local development

**Purpose**: Error monitoring and tracking

**Use Cases**:
- View Sentry errors in VS Code
- Link code to error traces
- Performance monitoring

---

## MCP Priority Order

Per `AGENTS.md`, use MCP servers in this priority:

1. **Context7** - MANDATORY FIRST (get library docs)
2. **Serena** - Symbol-aware code analysis
3. **Next DevTools** - Next.js specific operations
4. **Prisma** - Database schema operations
5. **GitHub** - Issues/PR context
6. **Filesystem** - Fallback file operations
7. **Playwright** - E2E test generation
8. **MUI** - UI component guidance (via Context7)

## Installation Locations

### GitHub Actions (Copilot Environment)

Installed via `.github/workflows/copilot-setup-steps.yml`:

```yaml
- Context7 MCP (npx)
- Prisma MCP (npm global)
- GitHub MCP (npm global)
- Filesystem MCP (npm global)
- Playwright MCP (npm global)
- Next DevTools MCP (package.json)
```

### Local Development

Configured in:

```
.vscode/mcp.json        → Sentry MCP (HTTP)
.serena/project.yml     → Serena MCP (local)
package.json            → Next DevTools MCP (dependency)
```

## Configuration Files

### `.vscode/mcp.json`

```jsonc
{
  "servers": {
    "Sentry": {
      "url": "https://mcp.sentry.dev/mcp/yukimura-ixa/phrasongsa-timetable",
      "type": "http"
    }
  }
}
```

**Purpose**: Configure HTTP-based MCP servers for local VS Code

---

### `.serena/project.yml`

```yaml
project:
  name: "school-timetable-senior-project"
  languages: ["typescript"]
  file_encoding: "utf-8"
```

**Purpose**: Configure Serena MCP for local development

---

### `.github/workflows/copilot-setup-steps.yml`

```yaml
jobs:
  copilot-setup-steps:
    steps:
      - Install Context7 MCP
      - Install Prisma MCP
      - Install GitHub MCP
      - Install Filesystem MCP
      - Install Playwright MCP
```

**Purpose**: Pre-install MCP servers in Copilot's GitHub Actions environment

---

## Usage Patterns

### Context7-First Protocol

**ALWAYS query Context7 before writing code:**

```typescript
// Step 1: Resolve library ID
resolve-library-id("next.js") → /vercel/next.js

// Step 2: Get documentation
get-library-docs("/vercel/next.js", topic="Server Actions")

// Step 3: Review patterns from official docs

// Step 4: Implement using authoritative API
```

### Serena-First for Code

**Use Serena before reading full files:**

```typescript
// Step 1: Get symbol overview
get_symbols_overview("src/features/schedule/assign.tsx")

// Step 2: Find specific symbols
find_symbol("AssignmentForm", include_body=true)

// Step 3: Find references
find_referencing_symbols("AssignmentForm")

// Step 4: Make targeted edits
replace_symbol_body("AssignmentForm", new_code)
```

### MCP Fallback Strategy

1. Try **Serena** for code operations
2. If unavailable, use **Filesystem MCP**
3. If both unavailable, state limitation and work read-only

## Environment Variables

MCP servers may need environment variables. Set in GitHub repository:

**Settings → Environments → copilot**

Required variables:
- `DATABASE_URL` - Prisma MCP needs this
- `GITHUB_TOKEN` - GitHub MCP (auto-provided)
- `AUTH_SECRET` - For authenticated operations

## Troubleshooting

### Issue: Context7 not working
- Check network connectivity
- Verify `npx -y @upstash/context7-mcp install` ran successfully
- Review Copilot session logs

### Issue: Serena unavailable in Copilot
- Expected - Serena is **local only**
- Use Filesystem MCP as fallback in GitHub Actions
- State limitation in responses

### Issue: Prisma MCP errors
- Ensure `DATABASE_URL` is set in `copilot` environment
- Check Prisma schema is valid
- Verify Prisma Client generated

### Issue: GitHub MCP permissions
- GitHub token auto-provided by Actions
- Check repository permissions
- Verify rate limits not exceeded

## Security Considerations

### Secrets Management
- Never hardcode credentials
- Use GitHub Secrets for sensitive data
- Set in `copilot` environment, not workflow file

### Network Access
- All MCP servers use HTTPS
- Context7: Upstash infrastructure
- GitHub MCP: Official GitHub APIs
- Sentry MCP: Sentry infrastructure

### Permissions
- Workflow uses minimal permissions (`contents: read`)
- Copilot gets separate token for operations
- No write access during MCP setup

## Performance Impact

### Setup Time
- Context7: ~10s (npx install)
- Prisma MCP: ~5s (npm global)
- GitHub MCP: ~5s (npm global)
- Filesystem MCP: ~3s (npm global)
- Playwright MCP: ~5s (npm global)

**Total**: ~2-3 minutes one-time setup per Copilot task

### Runtime Performance
- MCP servers add minimal overhead
- Network calls cached where possible
- Serena operations are token-efficient

## Maintenance

### When to Update
- New MCP server releases
- Breaking changes in MCP APIs
- Project dependency updates
- Performance optimization needs

### Testing Updates
1. Update workflow file
2. Create PR and test in Actions
3. Monitor Copilot session logs
4. Verify MCP operations work

## Related Documentation

- **AGENTS.md**: MCP-First workflow and priorities
- **copilot-instructions.md**: Copilot configuration
- **.github/COPILOT_MCP_SETUP.md**: Workflow documentation
- **Serena docs**: `.serena/project.yml` comments

---

## Quick Reference

| MCP Server | Package | Environment | Purpose |
|------------|---------|-------------|---------|
| Context7 | `@upstash/context7-mcp` | Copilot | Library docs ⭐ |
| Serena | Local config | Local | Code navigation ⭐ |
| Next DevTools | `next-devtools-mcp` | Both | Next.js 16 ops |
| Prisma | `@prisma/mcp-server-prisma` | Copilot | Schema/migrations |
| GitHub | `@modelcontextprotocol/server-github` | Copilot | Issues/PRs |
| Filesystem | `@modelcontextprotocol/server-filesystem` | Copilot | File ops |
| Playwright | `@playwright/mcp-server` | Copilot | E2E tests |
| Sentry | HTTP URL | Local | Error tracking |

**Remember**: Context7 FIRST, Serena for code, everything else as needed! 🎯
