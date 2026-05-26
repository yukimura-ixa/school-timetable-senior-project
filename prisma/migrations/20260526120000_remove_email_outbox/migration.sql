-- Remove the email outbox: no mail service is configured and all
-- email-sending wiring (password reset, email verification, email change)
-- has been removed from the application. The table and its enums are
-- dropped here so the database matches schema.prisma.

-- DropTable (also drops its indexes and the User FK constraint)
DROP TABLE IF EXISTS "EmailOutbox";

-- DropEnum
DROP TYPE IF EXISTS "EmailOutboxStatus";
DROP TYPE IF EXISTS "EmailOutboxKind";
