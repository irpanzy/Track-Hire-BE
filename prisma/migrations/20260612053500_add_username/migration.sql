-- AlterTable
ALTER TABLE "users" ADD COLUMN "username" TEXT;

-- Backfill existing users with a username derived from their email
UPDATE "users" SET "username" = SPLIT_PART("email", '@', 1) || '_' || LEFT("id", 6) WHERE "username" IS NULL;

-- Make username NOT NULL and UNIQUE
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
