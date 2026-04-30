import { computed, ref } from "vue";
import { api } from "@/lib/supabase";

const reviews = ref([]);
const nextCursor = ref(null);
const loading = ref(false);
let initialLoaded = false;

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

function ensureLoaded() {
  if (!initialLoaded) {
    initialLoaded = true;
    fetchReviews();
  }
}

const averageRating = computed(() => {
  const total = reviews.value.reduce((sum, r) => sum + r.rating, 0);
  return reviews.value.length
    ? (total / reviews.value.length).toFixed(1)
    : "0.0";
});

const recommendationRate = computed(() => {
  const recommended = reviews.value.filter((r) => r.rating >= 4).length;
  return reviews.value.length
    ? Math.round((recommended / reviews.value.length) * 100)
    : 0;
});

export function useReviews() {
  ensureLoaded();

  async function addReview({ userName, comment, rating }) {
    const review = await api.postReview({ userName, comment, rating });
    reviews.value = [review, ...reviews.value];
    return review;
  }

  async function loadMore() {
    if (nextCursor.value) {
      await fetchReviews(nextCursor.value);
    }
  }

  return {
    reviews,
    averageRating,
    recommendationRate,
    addReview,
    loadMore,
    hasMore: computed(() => !!nextCursor.value),
    loading,
  };
}
