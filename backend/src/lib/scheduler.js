import cron from "node-cron";
import { prisma } from "./prisma.js";
import { invalidateMenuCache } from "../routes/menu.js";
import { processIncomingUploads } from "./upload-cleanup.js";

const DEDUP_MEDIA_CRON = process.env.DEDUP_MEDIA_CRON || "0 3 * * 0";
const JOB_RUN_RETENTION_DAYS = Number(process.env.JOB_RUN_RETENTION_DAYS || 30);
const MAX_TIMER_DELAY_MS = 2147483647;
const RESCHEDULE_RETRY_MS = 60000;

let schedulerLogger = null;
let nextExpiryTimer = null;

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

function getLogger(logger) {
  return logger || schedulerLogger || console;
}

async function runDeactivateExpiredItems(logger) {
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

    const itemsChanged = sales.count + vouchers.count;
    if (itemsChanged > 0) {
      const durationMs = Date.now() - jobStart;
      await logJobRunWithRetry(
        jobName,
        "success",
        itemsChanged,
        null,
        durationMs,
        logger,
      );
    }
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
}

export async function rescheduleExpiryDeactivation(logger) {
  const activeLogger = getLogger(logger);
  schedulerLogger = activeLogger;

  if (nextExpiryTimer) {
    clearTimeout(nextExpiryTimer);
    nextExpiryTimer = null;
  }

  try {
    const [nextSale, nextVoucher] = await Promise.all([
      prisma.flashSale.findFirst({
        where: { isActive: true },
        orderBy: { endsAt: "asc" },
        select: { endsAt: true },
      }),
      prisma.voucher.findFirst({
        where: { isActive: true },
        orderBy: { validUntil: "asc" },
        select: { validUntil: true },
      }),
    ]);

    const timestamps = [
      nextSale?.endsAt ? new Date(nextSale.endsAt).getTime() : null,
      nextVoucher?.validUntil
        ? new Date(nextVoucher.validUntil).getTime()
        : null,
    ].filter((value) => Number.isFinite(value));

    if (!timestamps.length) {
      activeLogger.debug("Scheduler: no upcoming expirations to schedule");
      return;
    }

    const now = Date.now();
    const nextExpiryAtMs = Math.min(...timestamps);
    const delayMs = Math.max(0, nextExpiryAtMs - now);
    const safeDelayMs = Math.min(delayMs, MAX_TIMER_DELAY_MS);

    nextExpiryTimer = setTimeout(async () => {
      nextExpiryTimer = null;
      await runDeactivateExpiredItems(activeLogger);
      await rescheduleExpiryDeactivation(activeLogger);
    }, safeDelayMs);

    activeLogger.debug(
      `Scheduler: next expiry check scheduled in ${safeDelayMs}ms`,
    );
  } catch (err) {
    activeLogger.error(
      err,
      "Scheduler: failed to reschedule expiry deactivation",
    );
    nextExpiryTimer = setTimeout(async () => {
      nextExpiryTimer = null;
      await rescheduleExpiryDeactivation(activeLogger);
    }, RESCHEDULE_RETRY_MS);
  }
}

export function startScheduler(logger) {
  schedulerLogger = logger;
  rescheduleExpiryDeactivation(logger).catch((err) => {
    logger.error(
      err,
      "Scheduler: failed to initialize expiry deactivation timer",
    );
  });

  // Self-heal on boot: reconcile any uploads left in incoming/ from before a
  // restart (e.g. a transcode interrupted by a redeploy). Without this they
  // would stay "processing" until the next upload or the weekly cron. Deferred
  // and non-blocking so it never delays startup; the concurrency guard inside
  // processIncomingUploads prevents overlap with other triggers.
  setTimeout(() => {
    processIncomingUploads(logger, { limit: 50 }).then(
      (processed) => {
        if (processed > 0) {
          logger.info(
            `Scheduler: reconciled ${processed} pending upload(s) on startup`,
          );
        }
      },
      (err) => logger.error(err, "Scheduler: startup reconciliation failed"),
    );
  }, 5000);

  // Fallback reconciliation for incoming uploads (primary path is immediate cleanup on upload)
  cron.schedule(DEDUP_MEDIA_CRON, async () => {
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
      if (processed > 0) {
        const durationMs = Date.now() - jobStart;
        await logJobRunWithRetry(
          jobName,
          "success",
          processed,
          null,
          durationMs,
          logger,
        );
      }
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

      const retentionCutoff = new Date(
        Date.now() - JOB_RUN_RETENTION_DAYS * 24 * 60 * 60 * 1000,
      );
      const oldJobRuns = await prisma.jobRun.deleteMany({
        where: { startedAt: { lt: retentionCutoff } },
      });
      if (oldJobRuns.count > 0) {
        logger.info(
          `Scheduler: pruned ${oldJobRuns.count} job run log(s) older than ${JOB_RUN_RETENTION_DAYS} day(s)`,
        );
      }

      const itemsChanged = tokens.count + events.count + oldJobRuns.count;
      if (itemsChanged > 0) {
        const durationMs = Date.now() - jobStart;
        await logJobRunWithRetry(
          jobName,
          "success",
          itemsChanged,
          null,
          durationMs,
          logger,
        );
      }
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
    `Scheduler started: dynamic expiry timer enabled, dedup fallback at ${DEDUP_MEDIA_CRON}, daily cleanup at 03:00`,
  );
}
