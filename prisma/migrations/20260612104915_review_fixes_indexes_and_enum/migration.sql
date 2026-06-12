/*
  Warnings:

  - The `old_status` column on the `application_histories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `new_status` on the `application_histories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "job_applications" DROP CONSTRAINT "job_applications_company_id_fkey";

-- AlterTable
ALTER TABLE "application_histories" DROP COLUMN "old_status",
ADD COLUMN     "old_status" "ApplicationStatus",
DROP COLUMN "new_status",
ADD COLUMN     "new_status" "ApplicationStatus" NOT NULL;

-- CreateIndex
CREATE INDEX "companies_deleted_at_idx" ON "companies"("deleted_at");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- CreateIndex
CREATE INDEX "job_applications_source_idx" ON "job_applications"("source");

-- CreateIndex
CREATE INDEX "job_applications_job_type_idx" ON "job_applications"("job_type");

-- CreateIndex
CREATE INDEX "job_applications_applied_date_idx" ON "job_applications"("applied_date");

-- CreateIndex
CREATE INDEX "job_applications_deadline_date_idx" ON "job_applications"("deadline_date");

-- CreateIndex
CREATE INDEX "job_applications_deleted_at_idx" ON "job_applications"("deleted_at");

-- CreateIndex
CREATE INDEX "reminders_deleted_at_idx" ON "reminders"("deleted_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
