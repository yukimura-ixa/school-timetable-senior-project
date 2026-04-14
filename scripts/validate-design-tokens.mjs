#!/usr/bin/env node
/**
 * Design Token Sync Validator
 * 
 * Validates that color tokens are synchronized between:
 * - src/app/globals.css (Tailwind CSS variables)
 * - src/shared/design-system.ts (MUI theme colors)
 * 
 * Run this script in CI to prevent token drift.
 * 
 * Usage:
 *   node scripts/validate-design-tokens.mjs
 *   pnpm run validate:tokens
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function warning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ ${message}`, 'blue');
}

// Read source files
const cssPath = resolve(__dirname, '../src/app/globals.css');
const tsPath = resolve(__dirname, '../src/shared/design-system.ts');

let cssContent, tsContent;
try {
  cssContent = readFileSync(cssPath, 'utf-8');
  tsContent = readFileSync(tsPath, 'utf-8');
} catch (err) {
  error(`Failed to read source files: ${err.message}`);
  process.exit(1);
}

// Extract color definitions from TypeScript file
// Example: main: "#3b82f6", // --color-ds-blue
const tsMainColorRegex = /main:\s*["']([^"']+)["'],?\s*\/\/\s*--color-ds-(\w+)/g;
const tsDarkColorRegex = /dark:\s*["']([^"']+)["'],?\s*\/\/\s*--color-ds-(\w+)-dark/g;
const tsLightColorRegex = /light:\s*["']([^"']+)["'],?\s*\/\/\s*--color-ds-(\w+)-light/g;

const tsColors = {};

// Parse main colors
let match;
while ((match = tsMainColorRegex.exec(tsContent)) !== null) {
  const [, value, colorName] = match;
  if (!tsColors[colorName]) tsColors[colorName] = {};
  tsColors[colorName].main = value;
}

// Parse dark colors
while ((match = tsDarkColorRegex.exec(tsContent)) !== null) {
  const [, value, colorName] = match;
  if (!tsColors[colorName]) tsColors[colorName] = {};
  tsColors[colorName].dark = value;
}

// Parse light colors
while ((match = tsLightColorRegex.exec(tsContent)) !== null) {
  const [, value, colorName] = match;
  if (!tsColors[colorName]) tsColors[colorName] = {};
  tsColors[colorName].light = value;
}

// Extract color definitions from CSS file
// Example: --color-ds-blue: #3b82f6;
const cssColorRegex = /--color-ds-(\w+(?:-\w+)?): ([^;]+);/g;
const cssColors = {};

while ((match = cssColorRegex.exec(cssContent)) !== null) {
  const [, varName, value] = match;
  
  // Parse variable name: "blue", "blue-dark", "blue-light"
  const parts = varName.split('-');
  const colorName = parts[0];
  const shade = parts.length > 1 ? parts.slice(1).join('-') : 'main';
  
  if (!cssColors[colorName]) {
    cssColors[colorName] = {};
  }
  cssColors[colorName][shade] = value.trim();
}

// Validation
let hasErrors = false;
let checkedCount = 0;

log('\n🔍 Validating Design Token Sync...\n', 'blue');

// Check each TypeScript color against CSS
for (const [colorName, shades] of Object.entries(tsColors)) {
  for (const [shade, tsValue] of Object.entries(shades)) {
    checkedCount++;
    
    const cssValue = cssColors[colorName]?.[shade];
    
    if (!cssValue) {
      error(`Missing CSS variable: --color-ds-${colorName}${shade === 'main' ? '' : `-${shade}`}`);
      info(`  Expected in globals.css: --color-ds-${colorName}${shade === 'main' ? '' : `-${shade}`}: ${tsValue};`);
      hasErrors = true;
    } else if (cssValue.toLowerCase() !== tsValue.toLowerCase()) {
      error(`Color mismatch for ${colorName}.${shade}:`);
      info(`  design-system.ts: ${tsValue}`);
      info(`  globals.css:      ${cssValue}`);
      hasErrors = true;
    }
  }
}

// Report results
log('\n' + '─'.repeat(60) + '\n');

if (hasErrors) {
  error(`Validation FAILED - Token sync errors detected!`);
  info(`\nTo fix:`);
  info(`  1. Update the mismatched values in either file`);
  info(`  2. Ensure both files define the same colors`);
  info(`  3. Re-run: pnpm run validate:tokens\n`);
  process.exit(1);
} else {
  success(`All ${checkedCount} design tokens are synchronized! ✨\n`);
  process.exit(0);
}
