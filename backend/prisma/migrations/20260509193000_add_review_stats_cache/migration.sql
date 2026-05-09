CREATE TABLE "review_stats" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "visible_count" INTEGER NOT NULL DEFAULT 0,
  "total_rating" INTEGER NOT NULL DEFAULT 0,
  "recommended_count" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "review_stats_pkey" PRIMARY KEY ("id")
);

INSERT INTO "review_stats" (
  "id",
  "visible_count",
  "total_rating",
  "recommended_count"
)
SELECT
  1,
  COUNT(*)::INTEGER,
  COALESCE(SUM("rating"), 0)::INTEGER,
  COUNT(*) FILTER (WHERE "rating" >= 4)::INTEGER
FROM "reviews"
WHERE "visible" = true
ON CONFLICT ("id") DO UPDATE
SET
  "visible_count" = EXCLUDED."visible_count",
  "total_rating" = EXCLUDED."total_rating",
  "recommended_count" = EXCLUDED."recommended_count",
  "updated_at" = CURRENT_TIMESTAMP;