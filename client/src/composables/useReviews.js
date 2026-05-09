import { computed, ref } from "vue";
import { api } from "@/lib/supabase";

const reviews = ref([]);
const nextCursor = ref(null);
const loading = ref(false);
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
  try {
    const res = await api.getReviews(cursor);
    if (cursor) {
      reviews.value = [...reviews.value, ...res.items];
    } else {
      reviews.value = res.items;
    }
    nextCursor.value = res.nextCursor;
  } catch {
    /* keep current */
  } finally {
    loading.value = false;
  }
}

async function fetchStats() {
  try {
    stats.value = await api.getReviewStats();
  } catch {
    /* keep defaults */
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

  return {
    reviews,
    averageRating,
    reviewCount,
    recommendationRate,
    addReview,
    loadMore,
    hasMore: computed(() => !!nextCursor.value),
    loading,
  };
}
