/* eslint-disable no-console */
/**
 * ConfigID Migration Script
 * 
 * Purpose: Migrate old ConfigID formats to canonical "SEMESTER-YEAR" format
 * Run: pnpm tsx scripts/migrate-configid.ts
 * 
 * ⚠️  CRITICAL: Backup your database before running this script!
 * 
 * This script will:
 * 1. Convert table_config.ConfigID to canonical format
 * 2. Update all timeslot.TimeslotID references
 * 3. Maintain referential integrity
 * 
 * Safe to run multiple times (idempotent)
 */

import prisma from '../src/lib/prisma';
import { Prisma } from '@/prisma/generated';

interface MigrationResult {
  success: boolean;
  table: string;
  recordsUpdated: number;
  errors: string[];
}

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
 * Migrate table_config records
 */
async function migrateTableConfig(): Promise<MigrationResult> {
  console.log('\n📊 Migrating table_config...');
  
  const result: MigrationResult = {
    success: true,
    table: 'table_config',
    recordsUpdated: 0,
    errors: [],
  };

  try {
    const configs = await prisma.table_config.findMany();
    
    for (const config of configs) {
      const canonical = convertToCanonical(config.ConfigID);
      
      if (canonical && canonical !== config.ConfigID) {
        try {
          // Create new record with canonical ConfigID
          await prisma.table_config.create({
            data: {
              ConfigID: canonical,
              AcademicYear: config.AcademicYear,
              Semester: config.Semester,
              Config: config.Config as unknown as Prisma.InputJsonValue,
              status: config.status,
              publishedAt: config.publishedAt,
              isPinned: config.isPinned,
              lastAccessedAt: config.lastAccessedAt,
              configCompleteness: config.configCompleteness,
              createdAt: config.createdAt,
              updatedAt: config.updatedAt,
            },
          });

          console.log(`   ✅ Created: ${canonical} (from ${config.ConfigID})`);
          result.recordsUpdated++;
        } catch (error) {
          if (error instanceof Error && error.message.includes('unique constraint')) {
            console.log(`   ℹ️  Skipped: ${canonical} (already exists)`);
          } else {
            const errorMsg = `Failed to migrate ${config.ConfigID}: ${error}`;
            console.error(`   ❌ ${errorMsg}`);
            result.errors.push(errorMsg);
            result.success = false;
          }
        }
      }
    }

    // Delete old format records ONLY if corresponding canonical record exists
    for (const config of configs) {
      const canonical = convertToCanonical(config.ConfigID);
      
      if (canonical && canonical !== config.ConfigID) {
        const canonicalExists = await prisma.table_config.findUnique({
          where: { ConfigID: canonical },
        });

        if (canonicalExists) {
          // Check if there are any timeslots still referencing the old ConfigID
          const timeslotsUsingOld = await prisma.timeslot.count({
            where: {
              TimeslotID: {
                startsWith: config.ConfigID,
              },
            },
          });

          if (timeslotsUsingOld === 0) {
            await prisma.table_config.delete({
              where: { ConfigID: config.ConfigID },
            });
            console.log(`   🗑️  Deleted old: ${config.ConfigID}`);
          } else {
            console.log(`   ⚠️  Kept old: ${config.ConfigID} (${timeslotsUsingOld} timeslots still reference it)`);
          }
        }
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error}`);
    console.error('   ❌ Error:', error);
  }

  return result;
}

/**
 * Migrate timeslot records
 */
async function migrateTimeslots(): Promise<MigrationResult> {
  console.log('\n📊 Migrating timeslot...');
  
  const result: MigrationResult = {
    success: true,
    table: 'timeslot',
    recordsUpdated: 0,
    errors: [],
  };

  try {
    const timeslots = await prisma.timeslot.findMany();
    
    for (const timeslot of timeslots) {
      // Extract ConfigID prefix and suffix
      let oldConfigId = '';
      let suffix = '';
      
      // Pattern: "1/2567-MON1" or "SEMESTER_1_2567-MON1"
      if (timeslot.TimeslotID.includes('/')) {
        const parts = timeslot.TimeslotID.split('-');
        oldConfigId = parts[0]; // "1/2567"
        suffix = parts.slice(1).join('-'); // "MON1"
      } else if (timeslot.TimeslotID.startsWith('SEMESTER_')) {
        const match = timeslot.TimeslotID.match(/^(SEMESTER_[1-3]_\d{4})-(.+)$/);
        if (match) {
          oldConfigId = match[1]; // "SEMESTER_1_2567"
          suffix = match[2]; // "MON1"
        }
      }
      
      if (oldConfigId && suffix) {
        const canonical = convertToCanonical(oldConfigId);
        
        if (canonical && canonical !== oldConfigId) {
          const newTimeslotId = `${canonical}-${suffix}`;
          
          try {
            // Create new timeslot with canonical ID
            await prisma.timeslot.create({
              data: {
                TimeslotID: newTimeslotId,
                AcademicYear: timeslot.AcademicYear,
                Semester: timeslot.Semester,
                StartTime: timeslot.StartTime,
                EndTime: timeslot.EndTime,
                Breaktime: timeslot.Breaktime,
                DayOfWeek: timeslot.DayOfWeek,
              },
            });

            console.log(`   ✅ Created: ${newTimeslotId} (from ${timeslot.TimeslotID})`);
            result.recordsUpdated++;

            // Delete old timeslot (will fail if referenced by class_schedule)
            try {
              await prisma.timeslot.delete({
                where: { TimeslotID: timeslot.TimeslotID },
              });
              console.log(`   🗑️  Deleted old: ${timeslot.TimeslotID}`);
            } catch {
              console.log(`   ⚠️  Could not delete ${timeslot.TimeslotID} (may be referenced by class_schedule)`);
            }
          } catch (error) {
            if (error instanceof Error && error.message.includes('unique constraint')) {
              console.log(`   ℹ️  Skipped: ${newTimeslotId} (already exists)`);
            } else {
              const errorMsg = `Failed to migrate ${timeslot.TimeslotID}: ${error}`;
              console.error(`   ❌ ${errorMsg}`);
              result.errors.push(errorMsg);
              result.success = false;
            }
          }
        }
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error}`);
    console.error('   ❌ Error:', error);
  }

  return result;
}

async function main() {
  console.log('🔄 ConfigID Migration');
  console.log('='.repeat(80));
  console.log('\n⚠️  This will migrate ConfigID formats to canonical "SEMESTER-YEAR"');
  console.log('⚠️  Make sure you have a database backup!\n');

  try {
    // Step 1: Migrate table_config
    const configResult = await migrateTableConfig();

    // Step 2: Migrate timeslots
    const timeslotResult = await migrateTimeslots();

    // Report results
    console.log('\n' + '='.repeat(80));
    console.log('📋 MIGRATION SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n${configResult.table}:`);
    console.log(`   Records updated: ${configResult.recordsUpdated}`);
    console.log(`   Status: ${configResult.success ? '✅ Success' : '❌ Failed'}`);
    if (configResult.errors.length > 0) {
      console.log(`   Errors: ${configResult.errors.length}`);
      configResult.errors.forEach(err => console.log(`     - ${err}`));
    }

    console.log(`\n${timeslotResult.table}:`);
    console.log(`   Records updated: ${timeslotResult.recordsUpdated}`);
    console.log(`   Status: ${timeslotResult.success ? '✅ Success' : '❌ Failed'}`);
    if (timeslotResult.errors.length > 0) {
      console.log(`   Errors: ${timeslotResult.errors.length}`);
      timeslotResult.errors.forEach(err => console.log(`     - ${err}`));
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('  1. Run verification: pnpm tsx scripts/verify-configid-migration.ts');
    console.log('  2. Run tests: pnpm test && pnpm test:e2e');
    console.log('  3. Check application in dev: pnpm dev\n');

    if (!configResult.success || !timeslotResult.success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
