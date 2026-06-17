-- AlterTable
CREATE TABLE "job_runs" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "job_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "duration_ms" INTEGER,
    "items_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "job_runs_job_name_started_at_idx" ON "job_runs"("job_name", "started_at");
CREATE INDEX "job_runs_job_name_status_idx" ON "job_runs"("job_name", "status");
