# Code Quality Audit - Action Plan & Quick Fixes

## Critical Fixes to Implement Immediately

### 1. Add Missing Cleanup to ConfigView.vue (5 min fix)

**File:** `admin/src/views/ConfigView.vue`

**Current Code (Line 227):**

```javascript
setTimeout(() => (saved.value = false), 2000);
```

**Problem:** Timer runs after component unmounts, causing state updates on destroyed component.

**Fix:**

```javascript
// At the top of setup
let savedTimeout = null;

// In save() function
setTimeout(() => (saved.value = false), 2000);

// Add onUnmounted hook
onUnmounted(() => {
  clearTimeout(debounceTimer);
  clearTimeout(savedTimeout); // ADD THIS
  loadData.value = false;
});
```

**Better approach - Use watch with cleanup:**

```javascript
import { watch } from "vue";

// Replace setTimeout with:
watch(
  () => saved.value,
  (newVal) => {
    if (newVal) {
      const timeout = setTimeout(() => {
        if (saved.value) saved.value = false;
      }, 2000);

      onUnmounted(() => clearTimeout(timeout));
    }
  },
  { once: true },
);
```

---

### 2. Add Error Logging to Upload Cleanup (10 min fix)

**Files to fix:**

- `admin/src/views/ConfigView.vue` (Line 114)
- `admin/src/views/FlashSalesView.vue` (Line 235)
- `admin/src/views/MenuView.vue` (Line 285)
- `admin/src/views/SpacesView.vue` (Line 214)

**Current Code Example:**

```javascript
await api.post("/upload/cleanup", { url: uploadedImageUrl }).catch(() => {});
```

**Fix:**

```javascript
await api.post("/upload/cleanup", { url: uploadedImageUrl }).catch((err) => {
  console.warn("Failed to cleanup uploaded file:", uploadedImageUrl, err);
  // Optional: Send to error tracking service
  if (window.errorTracker) {
    window.errorTracker.captureException(new Error("Upload cleanup failed"), {
      tags: { context: "cleanup" },
      extra: { url: uploadedImageUrl },
    });
  }
});
```

---

### 3. Add Explicit Watch Cleanup (15 min fix)

**File:** `admin/src/views/FlashSalesView.vue`

**Current Code (Lines 77-82):**

```javascript
watch([filterStatus, sortBy, page], loadData);
watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    page.value = 1;
    loadData();
  }, 300);
});

onUnmounted(() => {
  clearTimeout(debounceTimer);
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
});
```

**Fix:**

```javascript
// Store watch stop functions
const stopFiltersWatch = watch([filterStatus, sortBy, page], loadData);
const stopSearchWatch = watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    page.value = 1;
    loadData();
  }, 300);
});

onUnmounted(() => {
  stopFiltersWatch(); // ADD THIS
  stopSearchWatch(); // ADD THIS
  clearTimeout(debounceTimer);
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
});
```

**Apply same fix to:**

- `admin/src/views/SpacesView.vue`
- `admin/src/views/VouchersView.vue`

---

### 4. Add Data Validation After API Calls (20 min fix)

**File:** `client/src/composables/useData.js`

**Current Code (Lines 94-127):**

```javascript
const [cats, sp, fs, v, g] = results;

if (cats.status === "fulfilled" && cats.value?.length) {
  menuCategories.value = cats.value.map((c) => ({...}));
}
```

**Problem:** No check that `cats.value` is actually an array. If API returns `{ status: "fulfilled", value: null }`, crash on `.map()`.

**Fix:**

```javascript
const [cats, sp, fs, v, g] = results;

// Add validation helper
function isArray(val) {
  return Array.isArray(val) && val.length > 0;
}

if (cats.status === "fulfilled" && isArray(cats.value)) {
  try {
    menuCategories.value = cats.value.map((c) => ({
      ...c,
      items: (c.items || []).map(normalizeItem),
    }));
  } catch (err) {
    console.error("Failed to process menu categories:", err);
    menuError.value = true;
  }
}

if (sp.status === "fulfilled") {
  try {
    const res = sp.value;
    const data = isArray(res?.items) ? res.items : [];
    spaces.value = data.map(normalizeItem);
    spacesPage.value = res?.page || 1;
    spacesTotalPages.value = res?.totalPages || 1;
  } catch (err) {
    console.error("Failed to process spaces:", err);
    spacesError.value = true;
  }
}
// ... repeat for other data types
```

---

### 5. Fix Race Conditions in Data Loading (30 min fix)

**File:** `client/src/composables/useData.js`

**Problem:** Multiple rapid calls to `loadAll()` can cause state inconsistencies.

**Fix:**

```javascript
let loadingPromise = null;

async function loadAll() {
  // If already loading, return existing promise
  if (loadingPromise) return loadingPromise;

  loading.value = true;
  error.value = false;
  resetState();

  loadingPromise = (async () => {
    try {
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

      // Process results...
      const allFailed = results.every((r) => r.status === "rejected");
      if (allFailed) {
        error.value = true;
      } else {
        loaded.value = true;
      }
    } catch (err) {
      console.error("loadAll failed:", err);
      error.value = true;
    } finally {
      loading.value = false;
    }
  })();

  return loadingPromise;
}

function retryAll() {
  loadingPromise = null;
  loaded.value = false;
  return loadAll();
}
```

---

### 6. Create Reusable Composable for List Pagination (45 min fix)

**Create new file:** `client/src/composables/useListPagination.js`

```javascript
import { ref, watch, onUnmounted, computed } from "vue";

export function useListPagination(fetchFn, options = {}) {
  const { ITEMS_PER_PAGE = 10, debounceMs = 300 } = options;

  const searchQuery = ref("");
  const filterStatus = ref("all");
  const sortBy = ref("date");
  const page = ref(1);

  let debounceTimer = null;
  const stopFiltersWatch = watch([filterStatus, sortBy, page], () => {
    fetchFn({
      search: searchQuery.value.trim(),
      status: filterStatus.value,
      sort: sortBy.value,
      page: page.value,
      limit: ITEMS_PER_PAGE,
    });
  });

  const stopSearchWatch = watch(searchQuery, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      page.value = 1;
      fetchFn({
        search: searchQuery.value.trim(),
        status: filterStatus.value,
        sort: sortBy.value,
        page: 1,
        limit: ITEMS_PER_PAGE,
      });
    }, debounceMs);
  });

  onUnmounted(() => {
    stopFiltersWatch();
    stopSearchWatch();
    clearTimeout(debounceTimer);
  });

  return {
    searchQuery,
    filterStatus,
    sortBy,
    page,
  };
}
```

**Then use in views:**

```javascript
// In FlashSalesView.vue
const { searchQuery, filterStatus, sortBy, page } = useListPagination(
  async (query) => {
    const res = await api.get(`/flash-sales`, query);
    sales.value = res.items;
    totalItems.value = res.total;
  },
  { ITEMS_PER_PAGE: 10 },
);
```

---

### 7. Add Data Validation Schema (30 min fix)

**Create new file:** `admin/src/lib/validation-schemas.js`

```javascript
export const flashSalesSchema = {
  title: { required: true, maxLength: 200 },
  description: { required: false, maxLength: 2000 },
  discountPercent: { required: true, min: 1, max: 100 },
  endsAt: { required: true, mustBeFuture: true },
  isActive: { required: false, type: "boolean" },
  visible: { required: false, type: "boolean" },
};

export const spacesSchema = {
  name: { required: true, maxLength: 200 },
  description: { required: false, maxLength: 2000 },
  price: { required: true, min: 0 },
  capacity: { required: true, min: 1 },
  available: { required: false, type: "boolean" },
  visible: { required: false, type: "boolean" },
};

export const vouchersSchema = {
  code: { required: true, pattern: "^[A-Za-z0-9_-]+$", maxLength: 50 },
  discountPercent: { required: true, min: 1, max: 100 },
  validUntil: { required: true, mustBeFuture: true },
  isActive: { required: false, type: "boolean" },
  visible: { required: false, type: "boolean" },
};

/**
 * Validate form data against schema
 * @param {Object} formData - Form data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} validator - Validator object (useFormValidation)
 * @returns {boolean} - True if valid
 */
export function validateFormBySchema(formData, schema, validator) {
  validator.clearErrors();

  for (const [field, rules] of Object.entries(schema)) {
    const value = formData[field];

    if (rules.required && !value) {
      validator.setError(field, `${field} is required`);
      continue;
    }

    if (
      rules.maxLength &&
      typeof value === "string" &&
      value.length > rules.maxLength
    ) {
      validator.setError(
        field,
        `${field} must not exceed ${rules.maxLength} characters`,
      );
    }

    if (rules.min && Number(value) < rules.min) {
      validator.setError(field, `${field} must be at least ${rules.min}`);
    }

    if (rules.max && Number(value) > rules.max) {
      validator.setError(field, `${field} must not exceed ${rules.max}`);
    }

    if (rules.pattern && value && !new RegExp(rules.pattern).test(value)) {
      validator.setError(field, `${field} has invalid format`);
    }

    if (rules.mustBeFuture && value) {
      validator.validateDateTime(value, field, field, { mustBeFuture: true });
    }
  }

  return !validator.hasErrors();
}
```

**Usage:**

```javascript
import {
  validateFormBySchema,
  flashSalesSchema,
} from "@/lib/validation-schemas.js";

async function save() {
  if (
    !validateFormBySchema(form.value, flashSalesSchema, useFormValidation())
  ) {
    return;
  }
  // Continue with save...
}
```

---

## Testing Checklist

After implementing fixes, verify:

- [ ] All timers cleaned up on unmount (use DevTools)
- [ ] No console errors when navigating between views
- [ ] Error messages display when API calls fail
- [ ] Rapid clicks on buttons don't cause race conditions
- [ ] File uploads properly clean up orphaned files
- [ ] Search input debounces correctly (300ms)
- [ ] All watchers stop when components unmount
- [ ] No memory leaks in performance profiler

---

## Monitoring Commands

**Check for memory leaks:**

```javascript
// In browser console
setInterval(() => {
  if (performance.memory) {
    console.log(
      "Memory:",
      Math.round(performance.memory.usedJSHeapSize / 1048576),
      "MB",
    );
  }
}, 1000);
```

**Monitor watchers:**

```javascript
// Add to main.js
import { watch } from "vue";
let watchCount = 0;
const originalWatch = watch;
window.watchCount = 0;
```

---

## Estimated Time Investment

| Task                             | Time           | Priority |
| -------------------------------- | -------------- | -------- |
| Fix ConfigView setTimeout        | 5 min          | CRITICAL |
| Add error logging (4 files)      | 10 min         | CRITICAL |
| Explicit watch cleanup (3 files) | 15 min         | HIGH     |
| Add data validation              | 20 min         | CRITICAL |
| Fix race conditions              | 30 min         | CRITICAL |
| Create pagination composable     | 45 min         | MEDIUM   |
| Add validation schemas           | 30 min         | MEDIUM   |
| **TOTAL**                        | **~2.5 hours** | -        |

---

## Long-term Improvements

1. **Implement TypeScript** - Catch type errors at build time
2. **Add Automated Testing** - Prevent regressions
3. **Set up Error Tracking** - Sentry or similar
4. **Create Component Library** - Standardize patterns
5. **Add Performance Monitoring** - Track Core Web Vitals
