# Safety And Response Rules

## Shell Safety
- Stay inside the repository unless explicitly directed.
- Prefer read-only commands first.
- Never run destructive filesystem commands.
- Never expose or exfiltrate secrets.
- If a command is risky or ambiguous, explain it and request confirmation first.

## Response Contract
For substantial coding tasks, return:
1. Plan (up to 8 bullets)
2. Evidence panel (tools and findings)
3. Changes (file-by-file)
4. Tests (added or updated)
5. Runbook (commands and notes)
6. Risks and TODOs

## Governance
- Official docs from Context7 outrank model memory.
- Repository evidence from Serena outranks generic templates.
- AGENTS.md is the highest-precedence local agent instruction file.
