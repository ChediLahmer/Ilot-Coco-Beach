import {
  listObjects,
  getObjectBuffer,
  uploadBufferToKey,
} from "../src/lib/storage.js";
import { optimizeVideo } from "../src/lib/media.js";

const VIDEO_RE = /\.(mp4|mov|m4v)$/i;

async function run() {
  const objects = await listObjects("");
  const videos = objects.filter(
    (o) => o.Key && VIDEO_RE.test(o.Key) && !o.Key.startsWith("dedup/"),
  );

  console.log(`Found ${videos.length} video object(s) to remux.`);

  let ok = 0;
  let failed = 0;
  for (const obj of videos) {
    const key = obj.Key;
    try {
      const buffer = await getObjectBuffer(key);
      const ext = key.split(".").pop().toLowerCase();
      const fixed = await optimizeVideo(buffer, ext);
      await uploadBufferToKey(key, fixed, "video/mp4");
      ok += 1;
      console.log(`  ✓ ${key} (${buffer.length} -> ${fixed.length} bytes)`);
    } catch (error) {
      failed += 1;
      console.error(`  ✗ ${key}: ${error.message}`);
    }
  }

  console.log(`Done. Fixed: ${ok}, failed: ${failed}.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
