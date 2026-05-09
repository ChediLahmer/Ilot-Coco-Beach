import cron from "node-cron";
import { prisma } from "./prisma.js";
import { invalidateMenuCache } from "../routes/menu.js";
import { processIncomingUploads } from "./upload-cleanup.js";

async function logJobRun(
  jobName,
  status,
  itemsCount = 0,
  errorMessage = null,
  durationMs = 0,
) {
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
  } catch (err) {
    // Silently fail to avoid breaking the scheduler
  }
}

export function startScheduler(logger) {
  // Every minute: deactivate expired flash sales and vouchers
  cron.schedule("* * * * *", async () => {
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
      await logJobRun(
        "deactivate-expired-items",
        "success",
        sales.count + vouchers.count,
        null,
        durationMs,
      );
    } catch (err) {
      logger.error(err, "Scheduler: failed to deactivate expired items");
      const durationMs = Date.now() - jobStart;
      await logJobRun(
        "deactivate-expired-items",
        "error",
        0,
        err.message,
        durationMs,
      );
    }
  });

  // Every minute: reconcile incoming direct-uploaded media and remove duplicates
  cron.schedule("* * * * *", async () => {
    const jobStart = Date.now();
    try {
      const processed = await processIncomingUploads(logger, { limit: 10 });
      if (processed > 0) {
        logger.info(`Scheduler: processed ${processed} incoming upload(s)`);
      }
      const durationMs = Date.now() - jobStart;
      await logJobRun("dedup-media", "success", processed, null, durationMs);
    } catch (err) {
      logger.error(err, "Scheduler: incoming upload cleanup failed");
      const durationMs = Date.now() - jobStart;
      await logJobRun("dedup-media", "error", 0, err.message, durationMs);
    }
  });

  // Daily at 3 AM: clean up expired password reset tokens and old analytics
  cron.schedule("0 3 * * *", async () => {
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
      await logJobRun(
        "cleanup-tokens-analytics",
        "success",
        tokens.count + events.count,
        null,
        durationMs,
      );
    } catch (err) {
      logger.error(err, "Scheduler: daily cleanup failed");
      const durationMs = Date.now() - jobStart;
      await logJobRun(
        "cleanup-tokens-analytics",
        "error",
        0,
        err.message,
        durationMs,
      );
    }
  });

  logger.info(
    "Scheduler started: expiry checks every minute, daily cleanup at 03:00",
  );
}
