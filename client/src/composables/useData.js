import { ref, computed, onMounted } from "vue";
import { api } from "@/lib/supabase";

const ITEMS_PER_PAGE = 8;

const menuCategories = ref([]);
const menuError = ref(false);

const spaces = ref([]);
const spacesPage = ref(1);
const spacesTotalPages = ref(1);
const spacesLoading = ref(false);
const spacesError = ref(false);

const flashSales = ref([]);
const flashSalesPage = ref(1);
const flashSalesTotalPages = ref(1);
const flashSalesLoading = ref(false);
const flashSalesError = ref(false);

const vouchersList = ref([]);
const vouchersPage = ref(1);
const vouchersTotalPages = ref(1);
const vouchersLoading = ref(false);
const vouchersError = ref(false);

const galleryImages = ref([]);
const galleryNextCursor = ref(null);
const galleryLoading = ref(false);
const galleryError = ref(false);
const loading = ref(false);
const loaded = ref(false);
const error = ref(false);

function normalizeItem(item) {
  if (item.description && !item.desc) {
    item.desc = item.description;
  }
  return item;
}

function resetState() {
  menuCategories.value = [];
  menuError.value = false;

  spaces.value = [];
  spacesPage.value = 1;
  spacesTotalPages.value = 1;
  spacesLoading.value = false;
  spacesError.value = false;

  flashSales.value = [];
  flashSalesPage.value = 1;
  flashSalesTotalPages.value = 1;
  flashSalesLoading.value = false;
  flashSalesError.value = false;

  vouchersList.value = [];
  vouchersPage.value = 1;
  vouchersTotalPages.value = 1;
  vouchersLoading.value = false;
  vouchersError.value = false;

  galleryImages.value = [];
  galleryNextCursor.value = null;
  galleryLoading.value = false;
  galleryError.value = false;
}

async function loadAll() {
  if (loaded.value) return;
  loading.value = true;
  error.value = false;
  resetState();

  let attempts = 0;
  let results;
  while (attempts < 2) {
    results = await Promise.allSettled([
      api.getMenuCategories(),
      api.getSpaces(1, ITEMS_PER_PAGE),
      api.getFlashSales(1, ITEMS_PER_PAGE),
      api.getVouchers(1, ITEMS_PER_PAGE),
      api.getGallery(),
    ]);
    const allFailed = results.every((r) => r.status === "rejected");
    if (!allFailed) break;
    attempts++;
    if (attempts < 2) await new Promise((r) => setTimeout(r, 2000));
  }

  const [cats, sp, fs, v, g] = results;

  menuError.value = cats.status === "rejected";
  if (cats.status === "fulfilled" && cats.value?.length) {
    menuCategories.value = cats.value.map((c) => ({
      ...c,
      items: (c.items || []).map(normalizeItem),
    }));
  }
  spacesError.value = sp.status === "rejected";
  if (sp.status === "fulfilled") {
    const res = sp.value;
    const data = (res?.items || res || []).map(normalizeItem);
    spaces.value = data;
    spacesPage.value = res?.page || 1;
    spacesTotalPages.value = res?.totalPages || 1;
  }
  flashSalesError.value = fs.status === "rejected";
  if (fs.status === "fulfilled") {
    const res = fs.value;
    const data = res?.items || res || [];
    flashSales.value = data;
    flashSalesPage.value = res?.page || 1;
    flashSalesTotalPages.value = res?.totalPages || 1;
  }
  vouchersError.value = v.status === "rejected";
  if (v.status === "fulfilled") {
    const res = v.value;
    const data = res?.items || res || [];
    vouchersList.value = data;
    vouchersPage.value = res?.page || 1;
    vouchersTotalPages.value = res?.totalPages || 1;
  }
  galleryError.value = g.status === "rejected";
  if (g.status === "fulfilled") {
    galleryImages.value = g.value?.items || [];
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
  spacesError.value = false;
  try {
    const page = spacesPage.value + 1;
    const res = await api.getSpaces(page, ITEMS_PER_PAGE);
    const data = (res?.items || []).map(normalizeItem);
    spaces.value = [...spaces.value, ...data];
    spacesPage.value = page;
    spacesTotalPages.value = res?.totalPages || page;
  } catch {
    spacesError.value = true;
  } finally {
    spacesLoading.value = false;
  }
}

async function loadMoreFlashSales() {
  if (
    flashSalesPage.value >= flashSalesTotalPages.value ||
    flashSalesLoading.value
  )
    return;
  flashSalesLoading.value = true;
  flashSalesError.value = false;
  try {
    const page = flashSalesPage.value + 1;
    const res = await api.getFlashSales(page, ITEMS_PER_PAGE);
    const data = res?.items || [];
    flashSales.value = [...flashSales.value, ...data];
    flashSalesPage.value = page;
    flashSalesTotalPages.value = res?.totalPages || page;
  } catch {
    flashSalesError.value = true;
  } finally {
    flashSalesLoading.value = false;
  }
}

async function loadMoreVouchers() {
  if (vouchersPage.value >= vouchersTotalPages.value || vouchersLoading.value)
    return;
  vouchersLoading.value = true;
  vouchersError.value = false;
  try {
    const page = vouchersPage.value + 1;
    const res = await api.getVouchers(page, ITEMS_PER_PAGE);
    const data = res?.items || [];
    vouchersList.value = [...vouchersList.value, ...data];
    vouchersPage.value = page;
    vouchersTotalPages.value = res?.totalPages || page;
  } catch {
    vouchersError.value = true;
  } finally {
    vouchersLoading.value = false;
  }
}

async function loadMoreGallery() {
  if (!galleryNextCursor.value || galleryLoading.value) return;
  galleryLoading.value = true;
  galleryError.value = false;
  try {
    const res = await api.getGallery(galleryNextCursor.value);
    galleryImages.value = [...galleryImages.value, ...res.items];
    galleryNextCursor.value = res.nextCursor;
  } catch {
    galleryError.value = true;
  } finally {
    galleryLoading.value = false;
  }
}

function retrySpaces() {
  loaded.value = false;
  return loadAll();
}

function retryFlashSales() {
  loaded.value = false;
  return loadAll();
}

function retryVouchers() {
  loaded.value = false;
  return loadAll();
}

function retryGallery() {
  loaded.value = false;
  return loadAll();
}

function retryAll() {
  loaded.value = false;
  return loadAll();
}

export function useData() {
  onMounted(loadAll);
  return {
    menuCategories,
    menuError,
    spaces,
    spacesHasMore: computed(() => spacesPage.value < spacesTotalPages.value),
    spacesError,
    spacesLoading,
    loadMoreSpaces,
    retrySpaces,
    flashSales,
    flashSalesHasMore: computed(
      () => flashSalesPage.value < flashSalesTotalPages.value,
    ),
    flashSalesError,
    flashSalesLoading,
    loadMoreFlashSales,
    retryFlashSales,
    vouchers: vouchersList,
    vouchersHasMore: computed(
      () => vouchersPage.value < vouchersTotalPages.value,
    ),
    vouchersError,
    vouchersLoading,
    loadMoreVouchers,
    retryVouchers,
    galleryImages,
    galleryHasMore: galleryNextCursor,
    galleryError,
    loadMoreGallery,
    retryGallery,
    loading,
    error,
    retry: retryAll,
  };
}
