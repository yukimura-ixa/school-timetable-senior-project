-- Add index on User.createdAt to match Prisma schema (@@index user_created_at_idx)
-- Safe-guarded to skip if the table is absent
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'User' AND n.nspname = current_schema()
  ) THEN
    CREATE INDEX IF NOT EXISTS "user_created_at_idx" ON "User"("createdAt");
  END IF;
END $$;
