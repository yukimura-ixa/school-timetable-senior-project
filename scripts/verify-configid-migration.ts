/* eslint-disable no-console */
/**
 * ConfigID Migration Verification Script
 * 
 * Purpose: Detect and report old ConfigID formats in the database
 * Run: pnpm tsx scripts/verify-configid-migration.ts
 * 
 * Checks:
 * 1. table_config.ConfigID format
 * 2. timeslot.TimeslotID format (should start with canonical ConfigID)
 * 
 * Reports:
 * - Count of records with old formats
 * - Examples of old format records
 * - Suggested migration commands
 */

import prisma from '../src/lib/prisma';

interface ConfigIDIssue {
  table: string;
  field: string;
  oldValue: string;
  suggestedNewValue: string;
  relatedRecords?: number;
}

const CANONICAL_CONFIGID_PATTERN = /^[1-3]-\d{4}$/;

/**
 * Convert old ConfigID format to canonical format
 */
function convertToCanonical(oldConfigId: string): string | null {
  // Pattern: SEMESTER_X_YYYY
  const semesterUnderscoreMatch = oldConfigId.match(/^SEMESTER_([1-3])_(\d{4})$/);
  if (semesterUnderscoreMatch) {
    const [, semester, year] = semesterUnderscoreMatch;
    return `${semester}-${year}`;
  }

  // Pattern: YYYY-SEMESTER_X
  const yearFirstMatch = oldConfigId.match(/^(\d{4})-SEMESTER_([1-3])$/);
  if (yearFirstMatch) {
    const [, year, semester] = yearFirstMatch;
    return `${semester}-${year}`;
  }

  // Pattern: X/YYYY
  const slashMatch = oldConfigId.match(/^([1-3])\/(\d{4})$/);
  if (slashMatch) {
    const [, semester, year] = slashMatch;
    return `${semester}-${year}`;
  }

  return null;
}

/**
 * Extract ConfigID prefix from TimeslotID
 */
function extractConfigIDFromTimeslot(timeslotId: string): string {
  // TimeslotID format: "CONFIGID-DAYPERIOD"
  // Examples:
  // - Canonical: "1-2567-MON1" → "1-2567"
  // - Old slash: "1/2567-MON1" → "1/2567"
  // - Old verbose: "SEMESTER_1_2567-MON1" → "SEMESTER_1_2567"
  
  const parts = timeslotId.split('-');
  
  // Handle canonical format: "1-2567-MON1"
  if (parts.length >= 3 && /^[1-3]$/.test(parts[0]) && /^\d{4}$/.test(parts[1])) {
    return `${parts[0]}-${parts[1]}`;
  }
  
  // Handle slash format: "1/2567-MON1"
  if (timeslotId.includes('/')) {
    const slashParts = timeslotId.split('-');
    return slashParts[0]; // "1/2567"
  }
  
  // Handle verbose format: "SEMESTER_1_2567-MON1"
  const verboseMatch = timeslotId.match(/^(SEMESTER_[1-3]_\d{4})-/);
  if (verboseMatch) {
    return verboseMatch[1];
  }
  
  return '';
}

/**
 * Check if ConfigID is in canonical format
 */
function isCanonicalFormat(configId: string): boolean {
  return CANONICAL_CONFIGID_PATTERN.test(configId);
}

// NOTE: Old format detection is inlined where needed using OLD_CONFIGID_PATTERNS

async function verifyTableConfig(): Promise<ConfigIDIssue[]> {
  console.log('\n📊 Checking table_config.ConfigID...');
  
  const issues: ConfigIDIssue[] = [];
  
  try {
    const allConfigs = await prisma.table_config.findMany({
      select: {
        ConfigID: true,
        AcademicYear: true,
        Semester: true,
      },
    });

    console.log(`   Found ${allConfigs.length} configuration records`);

    for (const config of allConfigs) {
      if (!isCanonicalFormat(config.ConfigID)) {
        const suggestedValue = convertToCanonical(config.ConfigID);
        
        if (suggestedValue) {
          issues.push({
            table: 'table_config',
            field: 'ConfigID',
            oldValue: config.ConfigID,
            suggestedNewValue: suggestedValue,
          });
        } else {
          console.warn(`   ⚠️  Cannot convert: ${config.ConfigID}`);
        }
      }
    }

    if (issues.length === 0) {
      console.log('   ✅ All ConfigIDs are in canonical format');
    } else {
      console.log(`   ❌ Found ${issues.length} ConfigIDs in old format`);
    }
  } catch (error) {
    console.error('   ❌ Error checking table_config:', error);
  }

  return issues;
}

async function verifyTimeslots(): Promise<ConfigIDIssue[]> {
  console.log('\n📊 Checking timeslot.TimeslotID...');
  
  const issues: ConfigIDIssue[] = [];
  
  try {
    const allTimeslots = await prisma.timeslot.findMany({
      select: {
        TimeslotID: true,
      },
    });

    console.log(`   Found ${allTimeslots.length} timeslot records`);

    const timeslotsByConfigId = new Map<string, number>();

    for (const timeslot of allTimeslots) {
      const configIdPrefix = extractConfigIDFromTimeslot(timeslot.TimeslotID);
      
      if (configIdPrefix && !isCanonicalFormat(configIdPrefix)) {
        timeslotsByConfigId.set(configIdPrefix, (timeslotsByConfigId.get(configIdPrefix) || 0) + 1);
      }
    }

    for (const [oldConfigId, count] of timeslotsByConfigId.entries()) {
      const suggestedValue = convertToCanonical(oldConfigId);
      
      if (suggestedValue) {
        issues.push({
          table: 'timeslot',
          field: 'TimeslotID',
          oldValue: `${oldConfigId}-*`,
          suggestedNewValue: `${suggestedValue}-*`,
          relatedRecords: count,
        });
      }
    }

    if (issues.length === 0) {
      console.log('   ✅ All TimeslotIDs use canonical ConfigID prefix');
    } else {
      console.log(`   ❌ Found ${issues.length} distinct old ConfigID prefixes`);
    }
  } catch (error) {
    console.error('   ❌ Error checking timeslots:', error);
  }

  return issues;
}

function generateMigrationReport(allIssues: ConfigIDIssue[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('📋 MIGRATION REPORT');
  console.log('='.repeat(80));

  if (allIssues.length === 0) {
    console.log('\n✅ No migration needed! All ConfigIDs are in canonical format.');
    console.log('\nCanonical format: "SEMESTER-YEAR" (e.g., "1-2567", "2-2568")');
    return;
  }

  console.log(`\n❌ Found ${allIssues.length} issues requiring migration\n`);

  // Group by table
  const byTable = new Map<string, ConfigIDIssue[]>();
  for (const issue of allIssues) {
    const current = byTable.get(issue.table) ?? [];
    current.push(issue);
    byTable.set(issue.table, current);
  }

  for (const [table, issues] of byTable.entries()) {
    console.log(`\n📊 ${table} (${issues.length} issues):`);
    console.log('-'.repeat(80));
    
    for (const issue of issues.slice(0, 5)) {
      console.log(`   Old: ${issue.oldValue}`);
      console.log(`   New: ${issue.suggestedNewValue}`);
      if (issue.relatedRecords) {
        console.log(`   Affects: ${issue.relatedRecords} records`);
      }
      console.log();
    }

    if (issues.length > 5) {
      console.log(`   ... and ${issues.length - 5} more\n`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📝 MIGRATION STEPS');
  console.log('='.repeat(80));
  console.log(`
⚠️  CRITICAL: Backup your database before running migration!

Option 1: Run automated migration script
  pnpm tsx scripts/migrate-configid.ts

Option 2: Manual SQL migration (for production)
  See: scripts/migrate-configid.sql

Option 3: Test migration in development first
  1. Backup: pnpm db:backup
  2. Migrate: pnpm tsx scripts/migrate-configid.ts
  3. Verify: pnpm tsx scripts/verify-configid-migration.ts
  4. Test: pnpm test && pnpm test:e2e
`);
}

async function main() {
  console.log('🔍 ConfigID Migration Verification');
  console.log('='.repeat(80));
  console.log('\nChecking database for old ConfigID formats...');

  try {
    const configIssues = await verifyTableConfig();
    const timeslotIssues = await verifyTimeslots();

    const allIssues = [...configIssues, ...timeslotIssues];

  generateMigrationReport(allIssues);

    // Exit with error code if issues found
    if (allIssues.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
