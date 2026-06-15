-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('LINKEDIN', 'GLINTS', 'JOBSTREET', 'UPWORK', 'INDEED', 'WEBSITE', 'INSTAGRAM', 'X', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW', 'TECHNICAL_TEST', 'HR_INTERVIEW', 'OFFERING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'REMOTE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "job_type" "JobType" NOT NULL,
    "location" TEXT,
    "source" "ApplicationSource" NOT NULL,
    "source_url" TEXT,
    "description" TEXT,
    "requirements" TEXT,
    "salary_range" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "applied_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_histories" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "old_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "application_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reminder_date" TIMESTAMP(3) NOT NULL,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "job_applications_user_id_idx" ON "job_applications"("user_id");

-- CreateIndex
CREATE INDEX "job_applications_company_id_idx" ON "job_applications"("company_id");

-- CreateIndex
CREATE INDEX "application_histories_application_id_idx" ON "application_histories"("application_id");

-- CreateIndex
CREATE INDEX "reminders_user_id_idx" ON "reminders"("user_id");

-- CreateIndex
CREATE INDEX "reminders_application_id_idx" ON "reminders"("application_id");

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_histories" ADD CONSTRAINT "application_histories_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
