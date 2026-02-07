-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
