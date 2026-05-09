import { createHash } from "crypto";
import { prisma } from "./prisma.js";
import {
  buildPublicUrl,
  deleteObjectKey,
  findExistingByHash,
  getObjectBuffer,
  listObjects,
  headObject,
  uploadBufferToKey,
  writeDedupMarker,
} from "./storage.js";

const INCOMING_PREFIX = "incoming/";

function urlToIncomingKey(url) {
  const marker = "/incoming/";
  const index = typeof url === "string" ? url.indexOf(marker) : -1;
  if (index === -1) return null;
  return url.slice(index + 1);
}

async function replaceUrlEverywhere(oldUrl, newUrl) {
  if (!oldUrl || oldUrl === newUrl) return 0;

  const updates = await Promise.all([
    prisma.siteConfig.updateMany({
      where: { value: oldUrl },
      data: { value: newUrl },
    }),
    prisma.menuItem.updateMany({
      where: { image: oldUrl },
      data: { image: newUrl },
    }),
    prisma.space.updateMany({
      where: { image: oldUrl },
      data: { image: newUrl },
    }),
    prisma.flashSale.updateMany({
      where: { image: oldUrl },
      data: { image: newUrl },
    }),
    prisma.galleryImage.updateMany({
      where: { url: oldUrl },
      data: { url: newUrl },
    }),
  ]);

  return updates.reduce((sum, item) => sum + item.count, 0);
}

export async function processIncomingUploads(logger, { limit = 10 } = {}) {
  const objects = await listObjects(INCOMING_PREFIX);
  const candidates = objects
    .filter((object) => object.Key && !object.Key.endsWith("/"))
    .slice(0, limit);

  if (!candidates.length) return 0;

  let processed = 0;
  for (const object of candidates) {
    const key = object.Key;
    const tempUrl = buildPublicUrl(key);
    try {
      const head = await headObject(key);
      const buffer = await getObjectBuffer(key);
      const hash = createHash("sha256").update(buffer).digest("hex");
      const existing = await findExistingByHash(hash);

      if (existing && existing !== tempUrl) {
        const updated = await replaceUrlEverywhere(tempUrl, existing);
        await deleteObjectKey(key);
        logger.info(
          `Upload cleanup: deduped ${key} -> ${existing} (${updated} DB ref(s) updated)`,
        );
      } else {
        const finalKey = key.replace(/^incoming\//, "");
        const finalUrl = buildPublicUrl(finalKey);
        await uploadBufferToKey(
          finalKey,
          buffer,
          head.ContentType || "application/octet-stream",
        );
        await writeDedupMarker(hash, finalKey);
        const updated = await replaceUrlEverywhere(tempUrl, finalUrl);
        await deleteObjectKey(key);
        logger.info(
          `Upload cleanup: promoted ${key} -> ${finalKey} (${updated} DB ref(s) updated)`,
        );
      }
      processed++;
    } catch (err) {
      logger.error(err, `Upload cleanup failed for ${key}`);
    }
  }

  return processed;
}

export function scheduleIncomingCleanup(logger, url) {
  const key = urlToIncomingKey(url);
  if (!key) return;
  setTimeout(async () => {
    try {
      await processIncomingUploads(logger, { limit: 10 });
    } catch (err) {
      logger.error(err, `Immediate upload cleanup failed for ${key}`);
    }
  }, 0);
}
