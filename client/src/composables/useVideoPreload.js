import { ref } from "vue";

const preloadedBuffers = ref(new Map());
const preloadProgress = ref(new Map());
const failedDirectFetch = ref(new Set());

function toProxyUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (url.includes("/api/media/proxy?url=")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  return `${apiBase}/media/proxy?url=${encodeURIComponent(url)}`;
}

export function useVideoPreload() {
  /**
   * Preload video metadata using HTTP Range requests
   * Tries direct R2 fetch first (fastest if CORS enabled)
   * Falls back to backend proxy on CORS errors
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

    // Use proxy if direct fetch previously failed for this URL
    const useProxy = failedDirectFetch.value.has(url);

    try {
      const fetchUrl = useProxy ? toProxyUrl(url) : url;

      // First, get file size with HEAD request
      const headResponse = await fetch(fetchUrl, { method: "HEAD", priority });
      const fileSize = parseInt(headResponse.headers.get("content-length"), 10);

      if (!fileSize) {
        preloadProgress.value.delete(url);
        return;
      }

      // Preload first 512KB (usually contains all moov metadata for short videos)
      const chunkSize = Math.min(512 * 1024, fileSize);
      const rangeResponse = await fetch(fetchUrl, {
        headers: { Range: `bytes=0-${chunkSize - 1}` },
        priority,
      });

      if (!rangeResponse.ok && rangeResponse.status !== 206) {
        // If direct R2 failed with CORS, try proxy
        if (!useProxy && rangeResponse.status === 0) {
          failedDirectFetch.value.add(url);
          preloadProgress.value.delete(url);
          // Retry with proxy
          return preloadVideoMetadata(url, priority);
        }
        preloadProgress.value.delete(url);
        return;
      }

      const buffer = await rangeResponse.arrayBuffer();
      preloadedBuffers.value.set(url, buffer);
      preloadProgress.value.delete(url);
    } catch (err) {
      // If direct R2 failed with CORS/network, try proxy
      if (
        !useProxy &&
        (err.name === "TypeError" || err.message.includes("CORS"))
      ) {
        failedDirectFetch.value.add(url);
        preloadProgress.value.delete(url);
        // Retry with proxy
        return preloadVideoMetadata(url, priority);
      }
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
    failedDirectFetch.value.delete(url);
  }

  return {
    preloadVideoMetadata,
    getPreloadedBuffer,
    isPreloading,
    clearPreload,
  };
}
