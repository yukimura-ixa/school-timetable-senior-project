# Migration Scripts

This directory contains scripts to help with codebase migrations and refactoring.

## Available Scripts

### migrate-imports.ps1

PowerShell script for automatically updating component imports from custom components to MUI-based components.

#### Usage

```powershell
# Preview changes (dry run)
.\scripts\migrate-imports.ps1 -ComponentName PrimaryButton -DryRun

# Execute migration for a single component
.\scripts\migrate-imports.ps1 -ComponentName PrimaryButton -Execute

# Migrate all components at once
.\scripts\migrate-imports.ps1 -All -Execute
```

#### Supported Components

- `PrimaryButton` - Button component
- `TextField` - Text input field
- `SearchBar` - Search input with icon
- `ErrorState` - Error message display
- `CheckBox` - Checkbox with label
- `All` - All of the above

#### Options

| Flag | Description |
|------|-------------|
| `-ComponentName` | Which component to migrate (or `All`) |
| `-DryRun` | Preview changes without modifying files |
| `-Execute` | Apply changes to files |
| `-SourcePath` | Custom source path (default: `src`) |

#### Examples

**Preview changes for PrimaryButton:**
```powershell
.\scripts\migrate-imports.ps1 -ComponentName PrimaryButton -DryRun
```

**Migrate PrimaryButton:**
```powershell
.\scripts\migrate-imports.ps1 -ComponentName PrimaryButton -Execute
```

**Migrate all components (dry run first):**
```powershell
.\scripts\migrate-imports.ps1 -All -DryRun
.\scripts\migrate-imports.ps1 -All -Execute
```

#### Safety

- Always run with `-DryRun` first to preview changes
- Script only updates import statements, not component usage
- Original files are modified directly (use git to revert if needed)
- Script reports all changes made

#### Output

The script provides detailed output:
- Files found for each component
- Changes made (or would make in dry run)
- Summary statistics
- Next steps after migration

## See Also

- [MUI Migration Quick Start Guide](../docs/MUI_MIGRATION_QUICKSTART.md)
- [MUI Migration Implementation Summary](../docs/MUI_MIGRATION_IMPLEMENTATION_SUMMARY.md)
- [MUI Migration Plan](../docs/MUI_MIGRATION_PLAN.md)
