/**
 * Database Backup Script
 *
 * Creates a JSON export of all database tables before destructive migrations.
 * Run this before `pnpm db:migrate:deploy` in production.
 *
 * Usage:
 *   pnpm tsx scripts/db-backup.ts
 *
 * Output:
 *   ./backups/backup-{timestamp}.json
 */

/* eslint-disable no-console */

import prisma from "../src/lib/prisma";
import * as fs from "fs";
import * as path from "path";

interface BackupData {
  timestamp: string;
  version: string;
  tables: {
    [tableName: string]: unknown[];
  };
}

async function createBackup(): Promise<void> {
  console.log("🔄 Starting database backup...\n");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups");
  const backupPath = path.join(backupDir, `backup-${timestamp}.json`);

  // Ensure backups directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log("📁 Created backups directory");
  }

  try {
    // Export all tables
    const backup: BackupData = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      tables: {},
    };

    console.log("📊 Exporting tables...");

    // Core curriculum tables
    backup.tables.subject = await prisma.subject.findMany();
    console.log(`  ✓ subject: ${backup.tables.subject.length} records`);

    backup.tables.gradelevel = await prisma.gradelevel.findMany();
    console.log(`  ✓ gradelevel: ${backup.tables.gradelevel.length} records`);

    backup.tables.program = await prisma.program.findMany();
    console.log(`  ✓ program: ${backup.tables.program.length} records`);

    backup.tables.room = await prisma.room.findMany();
    console.log(`  ✓ room: ${backup.tables.room.length} records`);

    backup.tables.teacher = await prisma.teacher.findMany();
    console.log(`  ✓ teacher: ${backup.tables.teacher.length} records`);

    // Schedule tables
    backup.tables.timeslot = await prisma.timeslot.findMany();
    console.log(`  ✓ timeslot: ${backup.tables.timeslot.length} records`);

    backup.tables.class_schedule = await prisma.class_schedule.findMany();
    console.log(
      `  ✓ class_schedule: ${backup.tables.class_schedule.length} records`
    );

    backup.tables.teachers_responsibility =
      await prisma.teachers_responsibility.findMany();
    console.log(
      `  ✓ teachers_responsibility: ${backup.tables.teachers_responsibility.length} records`
    );

    // Config tables
    backup.tables.table_config = await prisma.table_config.findMany();
    console.log(
      `  ✓ table_config: ${backup.tables.table_config.length} records`
    );

    // Auth tables (excluding sensitive session data)
    backup.tables.user = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude sensitive fields
      },
    });
    console.log(`  ✓ user: ${backup.tables.user.length} records`);

    // Write backup file
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    const fileSizeKB = (fs.statSync(backupPath).size / 1024).toFixed(2);
    console.log(`\n✅ Backup completed successfully!`);
    console.log(`📁 File: ${backupPath}`);
    console.log(`📦 Size: ${fileSizeKB} KB`);

    const totalRecords = Object.values(backup.tables).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    console.log(`📊 Total records: ${totalRecords}`);

    // Summary
    console.log("\n📋 Backup Summary:");
    console.log("─".repeat(40));
    for (const [table, records] of Object.entries(backup.tables)) {
      console.log(`  ${table.padEnd(25)} ${records.length}`);
    }
    console.log("─".repeat(40));
  } catch (error) {
    console.error("\n❌ Backup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run backup
createBackup().catch(console.error);
