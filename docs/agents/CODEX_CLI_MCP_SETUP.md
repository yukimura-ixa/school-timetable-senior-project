# Codex CLI – MCP Setup (Playwright)

Repo **pnpm-only**. Use `pnpm` not `npx` for MCP server commands.

## Add Playwright MCP to Codex CLI

Run:

```powershell
.\scripts\setup-codex-playwright-mcp.ps1
```

Or manual:

```powershell
codex mcp add playwright -- pnpm dlx @playwright/mcp@latest
```

Verify:

```powershell
codex mcp get playwright
```

## VS Code MCP config

Repo also ships `.vscode/mcp.json` for editor MCP servers. Configured to use `pnpm` for Playwright + other servers.