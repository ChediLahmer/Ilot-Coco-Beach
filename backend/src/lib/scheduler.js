import cron from "node-cron";
import { prisma } from "./prisma.js";

export function startScheduler(logger) {
  // Every minute: deactivate expired flash sales and vouchers
  cron.schedule("* * * * *", async () => {
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
    } catch (err) {
      logger.error(err, "Scheduler: failed to deactivate expired items");
    }
  });

  // Daily at 3 AM: clean up expired password reset tokens and old analytics
  cron.schedule("0 3 * * *", async () => {
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

      // Archive analytics events older than 90 days
      const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const events = await prisma.analyticsEvent.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      if (events.count > 0) {
        logger.info(
          `Scheduler: purged ${events.count} analytics event(s) older than 90 days`,
        );
      }
    } catch (err) {
      logger.error(err, "Scheduler: daily cleanup failed");
    }
  });

  logger.info(
    "Scheduler started: expiry checks every minute, daily cleanup at 03:00",
  );
}
