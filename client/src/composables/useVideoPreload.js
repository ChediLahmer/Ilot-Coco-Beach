import { ref } from "vue";

const preloadedBuffers = ref(new Map());
const preloadProgress = ref(new Map());

export function useVideoPreload() {
  /**
   * Preload video metadata using HTTP Range requests
   * Fetches first ~512KB which typically contains full moov atom
   * Allows browser to start playback immediately
   */
  async function preloadVideoMetadata(url, priority = "low") {
    if (!url || typeof url !== "string") return;

    // Skip if already preloaded or in progress
    if (preloadedBuffers.value.has(url) || preloadProgress.value.has(url)) {
      return;
    }

    preloadProgress.value.set(url, 0);

    try {
      // First, get file size with HEAD request
      const headResponse = await fetch(url, { method: "HEAD", priority });
      const fileSize = parseInt(headResponse.headers.get("content-length"), 10);

      if (!fileSize) {
        preloadProgress.value.delete(url);
        return;
      }

      // Preload first 512KB (usually contains all moov metadata for short videos)
      const chunkSize = Math.min(512 * 1024, fileSize);
      const rangeResponse = await fetch(url, {
        headers: { Range: `bytes=0-${chunkSize - 1}` },
        priority,
      });

      if (!rangeResponse.ok && rangeResponse.status !== 206) {
        preloadProgress.value.delete(url);
        return;
      }

      const buffer = await rangeResponse.arrayBuffer();
      preloadedBuffers.value.set(url, buffer);
      preloadProgress.value.delete(url);
    } catch (err) {
      console.error("Video preload failed:", err);
      preloadProgress.value.delete(url);
    }
  }

  function getPreloadedBuffer(url) {
    return preloadedBuffers.value.get(url);
  }

  function isPreloading(url) {
    return preloadProgress.value.has(url);
  }

  function clearPreload(url) {
    preloadedBuffers.value.delete(url);
    preloadProgress.value.delete(url);
  }

  return {
    preloadVideoMetadata,
    getPreloadedBuffer,
    isPreloading,
    clearPreload,
  };
}
