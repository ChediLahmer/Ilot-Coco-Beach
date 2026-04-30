import { ref, onMounted } from "vue";
import { api } from "@/lib/supabase";

const menuCategories = ref([]);
const spaces = ref([]);
const flashSales = ref([]);
const vouchersList = ref([]);
const galleryImages = ref([]);
const galleryNextCursor = ref(null);
const galleryLoading = ref(false);
const loading = ref(false);
const loaded = ref(false);

function normalizeItem(item) {
  if (item.description && !item.desc) {
    item.desc = item.description;
  }
  return item;
}

async function loadAll() {
  if (loaded.value) return;
  loading.value = true;

  const results = await Promise.allSettled([
    api.getMenuCategories(),
    api.getSpaces(),
    api.getFlashSales(),
    api.getVouchers(),
    api.getGallery(),
  ]);

  const [cats, sp, fs, v, g] = results;

  if (cats.status === "fulfilled" && cats.value?.length) {
    menuCategories.value = cats.value.map((c) => ({
      ...c,
      items: (c.items || []).map(normalizeItem),
    }));
  }
  if (sp.status === "fulfilled") {
    const data = sp.value || [];
    if (data.length) spaces.value = data.map(normalizeItem);
  }
  if (fs.status === "fulfilled") {
    const data = fs.value || [];
    if (data.length) flashSales.value = data;
  }
  if (v.status === "fulfilled") {
    const data = v.value || [];
    if (data.length) vouchersList.value = data;
  }
  if (g.status === "fulfilled" && g.value?.items?.length) {
    galleryImages.value = g.value.items;
    galleryNextCursor.value = g.value.nextCursor;
  }

  loading.value = false;
  loaded.value = true;
}

async function loadMoreGallery() {
  if (!galleryNextCursor.value || galleryLoading.value) return;
  galleryLoading.value = true;
  try {
    const res = await api.getGallery(galleryNextCursor.value);
    galleryImages.value = [...galleryImages.value, ...res.items];
    galleryNextCursor.value = res.nextCursor;
  } catch {
    /* ignore */
  } finally {
    galleryLoading.value = false;
  }
}

export function useData() {
  onMounted(loadAll);
  return {
    menuCategories,
    spaces,
    flashSales,
    vouchers: vouchersList,
    galleryImages,
    galleryHasMore: galleryNextCursor,
    loadMoreGallery,
    loading,
  };
}
