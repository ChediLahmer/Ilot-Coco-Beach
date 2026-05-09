import { prisma } from "./prisma.js";

const REVIEW_STATS_ID = 1;

function parseStoredInt(value) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function isRecommended(rating) {
  return Number(rating) >= 4;
}

function toPublicStats(raw) {
  const count = raw.count;
  const average = count
    ? Math.round((raw.totalRating / count + Number.EPSILON) * 10) / 10
    : 0;
  const recommendRate = count
    ? Math.round((raw.recommendedCount / count) * 100)
    : 0;

  return { count, average, recommendRate };
}

async function readStoredStats(client = prisma) {
  const row = await client.reviewStats.findUnique({
    where: { id: REVIEW_STATS_ID },
  });

  const count = parseStoredInt(row?.visibleCount);
  const totalRating = parseStoredInt(row?.totalRating);
  const recommendedCount = parseStoredInt(row?.recommendedCount);

  if (count === null || totalRating === null || recommendedCount === null) {
    return null;
  }

  return { count, totalRating, recommendedCount };
}

async function writeStoredStats(stats, client = prisma) {
  await client.reviewStats.upsert({
    where: { id: REVIEW_STATS_ID },
    update: {
      visibleCount: stats.count,
      totalRating: stats.totalRating,
      recommendedCount: stats.recommendedCount,
    },
    create: {
      id: REVIEW_STATS_ID,
      visibleCount: stats.count,
      totalRating: stats.totalRating,
      recommendedCount: stats.recommendedCount,
    },
  });
}

async function computeStats(client = prisma) {
  const agg = await client.review.aggregate({
    where: { visible: true },
    _count: true,
    _sum: { rating: true },
  });
  const count = agg._count;
  const totalRating = agg._sum.rating ?? 0;
  const recommendedCount = await client.review.count({
    where: { visible: true, rating: { gte: 4 } },
  });

  return { count, totalRating, recommendedCount };
}

export async function getStoredReviewStats(client = prisma) {
  const stored = await readStoredStats(client);
  if (stored) return toPublicStats(stored);

  const computed = await computeStats(client);
  await writeStoredStats(computed, client);
  return toPublicStats(computed);
}

export async function adjustReviewStatsForVisibilityChange(
  before,
  after,
  client = prisma,
) {
  if (!before || before.visible === after.visible) return;

  const stats = (await readStoredStats(client)) ?? (await computeStats(client));

  if (!before.visible && after.visible) {
    stats.count += 1;
    stats.totalRating += after.rating;
    if (isRecommended(after.rating)) stats.recommendedCount += 1;
  } else if (before.visible && !after.visible) {
    stats.count = Math.max(0, stats.count - 1);
    stats.totalRating = Math.max(0, stats.totalRating - before.rating);
    if (isRecommended(before.rating)) {
      stats.recommendedCount = Math.max(0, stats.recommendedCount - 1);
    }
  }

  await writeStoredStats(stats, client);
}

export async function adjustReviewStatsForDelete(review, client = prisma) {
  if (!review?.visible) return;

  const stats = (await readStoredStats(client)) ?? (await computeStats(client));

  stats.count = Math.max(0, stats.count - 1);
  stats.totalRating = Math.max(0, stats.totalRating - review.rating);
  if (isRecommended(review.rating)) {
    stats.recommendedCount = Math.max(0, stats.recommendedCount - 1);
  }

  await writeStoredStats(stats, client);
}

export async function refreshStoredReviewStats(client = prisma) {
  const stats = await computeStats(client);
  await writeStoredStats(stats, client);
  return toPublicStats(stats);
}
