import { computed, ref } from "vue";
import { api } from "@/lib/supabase";

const reviews = ref([]);
const nextCursor = ref(null);
const loading = ref(false);
const reviewsError = ref(false);
const stats = ref({ count: 0, average: 0, recommendRate: 0 });
let initialLoaded = false;

function getDeviceId() {
  const KEY = "coco_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

async function fetchReviews(cursor) {
  if (loading.value) return;
  loading.value = true;
  reviewsError.value = false;
  let attempts = 0;
  let success = false;
  while (attempts < 2) {
    try {
      const res = await api.getReviews(cursor);
      if (cursor) {
        reviews.value = [...reviews.value, ...res.items];
      } else {
        reviews.value = res.items;
      }
      nextCursor.value = res.nextCursor;
      success = true;
      break;
    } catch {
      attempts++;
      if (attempts < 2) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  if (!success && !cursor) reviewsError.value = true;
  loading.value = false;
}

async function fetchStats() {
  let attempts = 0;
  while (attempts < 2) {
    try {
      stats.value = await api.getReviewStats();
      break;
    } catch {
      attempts++;
      if (attempts < 2) await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

function ensureLoaded() {
  if (!initialLoaded) {
    initialLoaded = true;
    fetchReviews();
    fetchStats();
  }
}

const averageRating = computed(() =>
  stats.value.count ? stats.value.average.toFixed(1) : "0.0",
);

const reviewCount = computed(() => stats.value.count);

const recommendationRate = computed(() => stats.value.recommendRate);

export function useReviews() {
  ensureLoaded();

  async function addReview({ userName, comment, rating }) {
    const deviceId = getDeviceId();
    await api.postReview({
      userName,
      comment,
      rating,
      deviceId,
    });
    fetchStats();
  }

  async function loadMore() {
    if (nextCursor.value) {
      await fetchReviews(nextCursor.value);
    }
  }

  async function retryReviews() {
    initialLoaded = false;
    reviews.value = [];
    ensureLoaded();
  }

  return {
    reviews,
    averageRating,
    reviewCount,
    recommendationRate,
    addReview,
    loadMore,
    hasMore: computed(() => !!nextCursor.value),
    loading,
    error: reviewsError,
    retryReviews,
  };
}
