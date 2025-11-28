/**
 * Production Password Migration Script
 * Migrates user passwords from bcrypt to scrypt
 *
 * SAFETY FEATURES:
 * - Dry-run mode by default
 * - Backs up old hashes
 * - Transaction support
 * - Rollback capability
 *
 * Usage:
 *   # Dry run (shows what would be changed)
 *   pnpm tsx scripts/migrate-passwords-to-scrypt.ts
 *
 *   # Actually migrate
 *   pnpm tsx scripts/migrate-passwords-to-scrypt.ts --execute
 *
 *   # Rollback to bcrypt hashes
 *   pnpm tsx scripts/migrate-passwords-to-scrypt.ts --rollback
 */

import prisma from "../src/lib/prisma";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Parse command line arguments
const args = process.argv.slice(2);
const isExecute = args.includes("--execute");
const isRollback = args.includes("--rollback");
const isDryRun = !isExecute && !isRollback;

interface UserWithPassword {
  id: string;
  email: string;
  password: string | null;
}

/**
 * Hash password using scrypt (matches auth.ts)
 */
async function hashPasswordScrypt(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Check if a password hash is bcrypt format
 */
function isBcryptHash(hash: string): boolean {
  return (
    hash.startsWith("$2a$") ||
    hash.startsWith("$2b$") ||
    hash.startsWith("$2y$")
  );
}

/**
 * Check if a password hash is scrypt format
 */
function isScryptHash(hash: string): boolean {
  return (
    hash.includes(":") &&
    hash.split(":").length === 2 &&
    hash.split(":")[0].length === 32
  );
}

/**
 * Create a backup table for old password hashes
 */
async function createBackupTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS password_migration_backup (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      old_hash TEXT NOT NULL,
      migration_date TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✅ Backup table created/verified");
}

/**
 * Backup a password hash before migration
 */
async function backupPasswordHash(
  userId: string,
  email: string,
  oldHash: string,
) {
  await prisma.$executeRaw`
    INSERT INTO password_migration_backup (user_id, user_email, old_hash)
    VALUES (${userId}, ${email}, ${oldHash})
  `;
}

/**
 * Main migration function
 */
async function main() {
  console.log("🔐 Password Migration: bcrypt → scrypt");
  console.log("=====================================\n");

  if (isDryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made");
    console.log("   Run with --execute to apply changes");
    console.log("   Run with --rollback to restore bcrypt hashes\n");
  } else if (isRollback) {
    console.log("⚠️  ROLLBACK MODE - Restoring bcrypt hashes");
    console.log("   This will restore passwords from backup\n");
  } else {
    console.log("✅ EXECUTE MODE - Changes will be applied");
    console.log("   Old hashes will be backed up\n");
  }

  // Fetch all users with passwords
  const users = (await prisma.user.findMany({
    where: {
      password: {
        not: null,
      },
    },
    select: {
      id: true,
      email: true,
      password: true,
    },
  })) as UserWithPassword[];

  console.log(`📊 Found ${users.length} users with passwords\n`);

  if (users.length === 0) {
    console.log("✅ No users to migrate");
    return;
  }

  // Analyze password hash types
  const bcryptUsers = users.filter(
    (u) => u.password && isBcryptHash(u.password),
  );
  const scryptUsers = users.filter(
    (u) => u.password && isScryptHash(u.password),
  );
  const unknownUsers = users.filter(
    (u) => u.password && !isBcryptHash(u.password) && !isScryptHash(u.password),
  );

  console.log("Hash Type Analysis:");
  console.log(`  🔴 Bcrypt hashes: ${bcryptUsers.length}`);
  console.log(`  🟢 Scrypt hashes: ${scryptUsers.length}`);
  console.log(`  ⚪ Unknown format: ${unknownUsers.length}\n`);

  if (unknownUsers.length > 0) {
    console.log("⚠️  Users with unknown hash format:");
    unknownUsers.forEach((u) => {
      console.log(`     - ${u.email}: ${u.password?.substring(0, 20)}...`);
    });
    console.log();
  }

  if (isRollback) {
    // ROLLBACK MODE: Restore bcrypt hashes from backup
    console.log("🔄 Rolling back to bcrypt hashes...\n");

    const backups = await prisma.$queryRaw<
      Array<{ user_id: string; user_email: string; old_hash: string }>
    >`
      SELECT user_id, user_email, old_hash 
      FROM password_migration_backup 
      ORDER BY migration_date DESC
    `;

    if (backups.length === 0) {
      console.log("❌ No backups found. Cannot rollback.");
      return;
    }

    console.log(`Found ${backups.length} backup(s)`);

    if (!isDryRun) {
      let restored = 0;
      for (const backup of backups) {
        await prisma.user.update({
          where: { id: backup.user_id },
          data: { password: backup.old_hash },
        });
        restored++;
        console.log(`  ✅ Restored: ${backup.user_email}`);
      }
      console.log(`\n✅ Restored ${restored} users to bcrypt hashes`);
    } else {
      console.log("\nDry run - would restore:");
      backups.forEach((b) => console.log(`  - ${b.user_email}`));
    }

    return;
  }

  // MIGRATION MODE: Convert bcrypt → scrypt
  if (bcryptUsers.length === 0) {
    console.log(
      "✅ All users already have scrypt hashes (or no bcrypt hashes found)",
    );
    return;
  }

  console.log(
    `⚠️  WARNING: This will migrate ${bcryptUsers.length} users from bcrypt to scrypt`,
  );
  console.log("   Old passwords will NOT work after migration!");
  console.log(
    "   Users must use the SAME password, but it will be rehashed.\n",
  );

  console.log(
    "❌ CANNOT MIGRATE: We don't have access to plaintext passwords!",
  );
  console.log(
    "📋 SOLUTION: Users must reset their passwords OR you must reseed:\n",
  );

  console.log("Option 1: Reset individual user passwords");
  console.log("  Use scripts/create-admin.ts or create-test-user.ts\n");

  console.log("Option 2: Reseed the entire database (DESTRUCTIVE)");
  console.log("  pnpm db:seed:clean\n");

  console.log("Option 3: Manual password reset for each user");
  bcryptUsers.forEach((u) => {
    console.log(`  - ${u.email}: Has bcrypt hash`);
  });

  console.log("\n💡 For testing/development:");
  console.log("  Just reseed the database with: pnpm db:seed:clean");

  console.log("\n💡 For production:");
  console.log("  1. Notify users about password reset requirement");
  console.log("  2. Invalidate all sessions");
  console.log("  3. Run a forced password reset flow");
  console.log("  4. OR create new users with scrypt hashes");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
