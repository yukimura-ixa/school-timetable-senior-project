# Codex CLI – MCP Setup (Playwright)

This repo uses **pnpm-only**. Prefer `pnpm` over `npx` for MCP server commands.

## Add Playwright MCP to Codex CLI

Run:

```powershell
.\scripts\setup-codex-playwright-mcp.ps1
```

Or manually:

```powershell
codex mcp add playwright -- pnpm dlx @playwright/mcp@latest
```

Verify:

```powershell
codex mcp get playwright
```

## VS Code MCP config

This repo also ships `.vscode/mcp.json` for editor MCP servers. It is configured to use `pnpm` for Playwright and other servers.
