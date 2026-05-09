import cron from "node-cron";
import { prisma } from "./prisma.js";
import { invalidateMenuCache } from "../routes/menu.js";
import { processIncomingUploads } from "./upload-cleanup.js";

// Simple in-memory job locks to prevent concurrent execution of the same job
const jobLocks = new Map();

/**
 * Acquire a job lock. Returns true if lock acquired, false if already running.
 */
function acquireJobLock(jobName) {
  if (jobLocks.has(jobName)) return false;
  jobLocks.set(jobName, true);
  return true;
}

/**
 * Release a job lock.
 */
function releaseJobLock(jobName) {
  jobLocks.delete(jobName);
}

/**
 * Log job run with retry logic (up to 3 attempts)
 */
async function logJobRunWithRetry(
  jobName,
  status,
  itemsCount = 0,
  errorMessage = null,
  durationMs = 0,
  logger,
  maxRetries = 3,
) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.jobRun.create({
        data: {
          jobName,
          status,
          itemsCount,
          errorMessage,
          durationMs,
          startedAt: new Date(Date.now() - durationMs),
          completedAt: new Date(),
        },
      });
      return; // Success
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt - 1) * 100; // Exponential backoff: 100ms, 200ms
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }
  // If all retries fail, log but don't throw (don't break the scheduler)
  logger.warn(
    lastError,
    `Failed to log job run ${jobName} after ${maxRetries} retries`,
  );
}

export function startScheduler(logger) {
  // Every minute: deactivate expired flash sales and vouchers
  cron.schedule("* * * * *", async () => {
    const jobName = "deactivate-expired-items";
    if (!acquireJobLock(jobName)) {
      logger.debug(`Job ${jobName} already running, skipping`);
      return;
    }

    const jobStart = Date.now();
    const now = new Date();
    try {
      const sales = await prisma.flashSale.updateMany({
        where: { isActive: true, endsAt: { lt: now } },
        data: { isActive: false },
      });
      if (sales.count > 0) {
        logger.info(
          `Scheduler: deactivated ${sales.count} expired flash sale(s)`,
        );
        invalidateMenuCache();
      }

      const vouchers = await prisma.voucher.updateMany({
        where: { isActive: true, validUntil: { lt: now } },
        data: { isActive: false },
      });
      if (vouchers.count > 0) {
        logger.info(
          `Scheduler: deactivated ${vouchers.count} expired voucher(s)`,
        );
      }

      const durationMs = Date.now() - jobStart;
      await logJobRunWithRetry(
        jobName,
        "success",
        sales.count + vouchers.count,
        null,
        durationMs,
        logger,
      );
    } catch (err) {
      logger.error(err, "Scheduler: failed to deactivate expired items");
      const durationMs = Date.now() - jobStart;
      await logJobRunWithRetry(
        jobName,
        "error",
        0,
        err.message,
        durationMs,
        logger,
      );
    } finally {
      releaseJobLock(jobName);
    }
  });

  // Every minute: reconcile incoming direct-uploaded media and remove duplicates
  cron.schedule("* * * * *", async () => {
    const jobName = "dedup-media";
    if (!acquireJobLock(jobName)) {
      logger.debug(`Job ${jobName} already running, skipping`);
      return;
    }

    const jobStart = Date.now();
    try {
      const processed = await processIncomingUploads(logger, { limit: 10 });
      if (processed > 0) {
        logger.info(`Scheduler: processed ${processed} incoming upload(s)`);
      }
      const durationMs = Date.now() - jobStart;
      await logJobRunWithRetry(
        jobName,
        "success",
        processed,
        null,
        durationMs,
        logger,
      );
    } catch (err) {
      logger.error(err, "Scheduler: incoming upload cleanup failed");
      const durationMs = Date.now() - jobStart;
      await logJobRunWithRetry(
        jobName,
        "error",
        0,
        err.message,
        durationMs,
        logger,
      );
    } finally {
      releaseJobLock(jobName);
    }
  });

  // Daily at 3 AM: clean up expired password reset tokens and old analytics
  cron.schedule("0 3 * * *", async () => {
    const jobName = "cleanup-tokens-analytics";
    if (!acquireJobLock(jobName)) {
      logger.debug(`Job ${jobName} already running, skipping`);
      return;
    }

    const jobStart = Date.now();
    try {
      const tokens = await prisma.passwordReset.deleteMany({
        where: {
          OR: [{ usedAt: { not: null } }, { expiresAt: { lt: new Date() } }],
        },
      });
      if (tokens.count > 0) {
        logger.info(
          `Scheduler: cleaned ${tokens.count} expired/used password reset token(s)`,
        );
      }

      // Purge analytics events older than 90 days
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const events = await prisma.analyticsEvent.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      if (events.count > 0) {
        logger.info(
          `Scheduler: purged ${events.count} analytics event(s) older than 90 days`,
        );
      }

      const durationMs = Date.now() - jobStart;
      await logJobRunWithRetry(
        jobName,
        "success",
        tokens.count + events.count,
        null,
        durationMs,
        logger,
      );
    } catch (err) {
      logger.error(err, "Scheduler: daily cleanup failed");
      const durationMs = Date.now() - jobStart;
      await logJobRunWithRetry(
        jobName,
        "error",
        0,
        err.message,
        durationMs,
        logger,
      );
    } finally {
      releaseJobLock(jobName);
    }
  });

  logger.info(
    "Scheduler started: expiry checks every minute, daily cleanup at 03:00",
  );
}
