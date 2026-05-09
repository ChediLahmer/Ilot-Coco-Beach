import { ref, computed, onMounted } from "vue";
import { api } from "@/lib/supabase";

const ITEMS_PER_PAGE = 8;

const menuCategories = ref([]);

const spaces = ref([]);
const spacesPage = ref(1);
const spacesTotalPages = ref(1);
const spacesLoading = ref(false);

const flashSales = ref([]);
const flashSalesPage = ref(1);
const flashSalesTotalPages = ref(1);
const flashSalesLoading = ref(false);

const vouchersList = ref([]);
const vouchersPage = ref(1);
const vouchersTotalPages = ref(1);
const vouchersLoading = ref(false);

const galleryImages = ref([]);
const galleryNextCursor = ref(null);
const galleryLoading = ref(false);
const loading = ref(false);
const loaded = ref(false);
const error = ref(false);

function normalizeItem(item) {
  if (item.description && !item.desc) {
    item.desc = item.description;
  }
  return item;
}

async function loadAll() {
  if (loaded.value) return;
  loading.value = true;
  error.value = false;

  const results = await Promise.allSettled([
    api.getMenuCategories(),
    api.getSpaces(1, ITEMS_PER_PAGE),
    api.getFlashSales(1, ITEMS_PER_PAGE),
    api.getVouchers(1, ITEMS_PER_PAGE),
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
    const res = sp.value;
    const data = (res?.items || res || []).map(normalizeItem);
    if (data.length) spaces.value = data;
    spacesPage.value = res?.page || 1;
    spacesTotalPages.value = res?.totalPages || 1;
  }
  if (fs.status === "fulfilled") {
    const res = fs.value;
    const data = res?.items || res || [];
    if (data.length) flashSales.value = data;
    flashSalesPage.value = res?.page || 1;
    flashSalesTotalPages.value = res?.totalPages || 1;
  }
  if (v.status === "fulfilled") {
    const res = v.value;
    const data = res?.items || res || [];
    if (data.length) vouchersList.value = data;
    vouchersPage.value = res?.page || 1;
    vouchersTotalPages.value = res?.totalPages || 1;
  }
  if (g.status === "fulfilled" && g.value?.items?.length) {
    galleryImages.value = g.value.items;
    galleryNextCursor.value = g.value.nextCursor;
  }

  const allFailed = results.every((r) => r.status === "rejected");
  if (allFailed) {
    error.value = true;
  } else {
    loaded.value = true;
  }
  loading.value = false;
}

async function loadMoreSpaces() {
  if (spacesPage.value >= spacesTotalPages.value || spacesLoading.value) return;
  spacesLoading.value = true;
  try {
    const page = spacesPage.value + 1;
    const res = await api.getSpaces(page, ITEMS_PER_PAGE);
    const data = (res?.items || []).map(normalizeItem);
    spaces.value = [...spaces.value, ...data];
    spacesPage.value = page;
    spacesTotalPages.value = res?.totalPages || page;
  } catch {
    /* ignore */
  } finally {
    spacesLoading.value = false;
  }
}

async function loadMoreFlashSales() {
  if (flashSalesPage.value >= flashSalesTotalPages.value || flashSalesLoading.value) return;
  flashSalesLoading.value = true;
  try {
    const page = flashSalesPage.value + 1;
    const res = await api.getFlashSales(page, ITEMS_PER_PAGE);
    const data = res?.items || [];
    flashSales.value = [...flashSales.value, ...data];
    flashSalesPage.value = page;
    flashSalesTotalPages.value = res?.totalPages || page;
  } catch {
    /* ignore */
  } finally {
    flashSalesLoading.value = false;
  }
}

async function loadMoreVouchers() {
  if (vouchersPage.value >= vouchersTotalPages.value || vouchersLoading.value) return;
  vouchersLoading.value = true;
  try {
    const page = vouchersPage.value + 1;
    const res = await api.getVouchers(page, ITEMS_PER_PAGE);
    const data = res?.items || [];
    vouchersList.value = [...vouchersList.value, ...data];
    vouchersPage.value = page;
    vouchersTotalPages.value = res?.totalPages || page;
  } catch {
    /* ignore */
  } finally {
    vouchersLoading.value = false;
  }
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
    spacesHasMore: computed(() => spacesPage.value < spacesTotalPages.value),
    spacesLoading,
    loadMoreSpaces,
    flashSales,
    flashSalesHasMore: computed(() => flashSalesPage.value < flashSalesTotalPages.value),
    flashSalesLoading,
    loadMoreFlashSales,
    vouchers: vouchersList,
    vouchersHasMore: computed(() => vouchersPage.value < vouchersTotalPages.value),
    vouchersLoading,
    loadMoreVouchers,
    galleryImages,
    galleryHasMore: galleryNextCursor,
    loadMoreGallery,
    loading,
    error,
    retry: loadAll,
  };
}
