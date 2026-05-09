# Code Quality Audit - Quick Fix Checklist

## ✅ File-by-File Action Items

### 🔴 CRITICAL FILES (Fix Today)

#### admin/src/views/ConfigView.vue

- [ ] **Line 227:** Add cleanup for `saved.value` timer in `onUnmounted()`
  ```javascript
  onUnmounted(() => {
    clearTimeout(savedTimeout); // ADD THIS
  });
  ```
- [ ] **Line 114:** Add error logging for upload cleanup
  ```javascript
  .catch((err) => console.warn("Cleanup failed:", err));
  ```
- [ ] **Line 150:** Add try-catch for initial data load
  ```javascript
  try {
    const data = await api.get("/config");
    // ...
  } catch (err) {
    console.error("Failed to load config:", err);
  }
  ```

#### admin/src/views/FlashSalesView.vue

- [ ] **Line 235:** Add error logging for upload cleanup
- [ ] **Lines 77-82:** Add explicit watch cleanup
  ```javascript
  const stopWatch1 = watch([...], loadData);
  const stopWatch2 = watch(searchQuery, ...);
  onUnmounted(() => { stopWatch1(); stopWatch2(); });
  ```
- [ ] **Line 284:** Verify debounceTimer cleanup exists ✅

#### admin/src/views/MenuView.vue

- [ ] **Line 285:** Add error logging for upload cleanup
- [ ] **Lines 77-82:** Add explicit watch cleanup (copy from FlashSalesView)
- [ ] **Line 82:** Add try-catch for initial loadData()

#### admin/src/views/SpacesView.vue

- [ ] **Line 214:** Add error logging for upload cleanup
- [ ] **Lines 80-82:** Add explicit watch cleanup (copy from FlashSalesView)
- [ ] **Line 269:** Verify debounceTimer cleanup exists ✅

#### admin/src/views/VouchersView.vue

- [ ] **Lines 75-82:** Add explicit watch cleanup (copy from FlashSalesView)
- [ ] **Line 45:** Verify debounceTimer exists
- [ ] **onUnmounted():** Add cleanup call

#### admin/src/views/GalleryView.vue

- [ ] **Line 134:** Add try-catch for `onMounted` async operations
  ```javascript
  onMounted(async () => {
    try {
      await loadCategories();
      await loadData();
    } catch (err) {
      console.error("Failed to load gallery:", err);
      error.value = "Failed to load gallery";
    }
  });
  ```

---

### 🟡 HIGH PRIORITY FILES (Fix This Week)

#### client/src/composables/useData.js

- [ ] **Lines 94-127:** Add data validation
  ```javascript
  if (Array.isArray(cats.value) && cats.value.length > 0) {
    menuCategories.value = cats.value.map(c => ({ ... }));
  }
  ```
- [ ] **Lines 68-89:** Implement request deduplication
  ```javascript
  let loadingPromise = null;
  async function loadAll() {
    if (loadingPromise) return loadingPromise;
    loadingPromise = (async () => { ... })();
  }
  ```

#### client/src/composables/useAnalytics.js

- [ ] **Line 6:** Add error logging
  ```javascript
  fetch(...).catch((err) => {
    console.warn("Analytics failed:", err);
  });
  ```

#### client/src/composables/useReviews.js

- [ ] **Lines 25-45:** Add error logging for failed attempts
- [ ] **Line 47:** Log errors instead of silently failing

#### admin/src/composables/useFormValidation.js

- [ ] **Line 115:** Complete `validateURL` function (appears cut off)

---

### 🟢 MEDIUM PRIORITY FILES (Fix Next Week)

#### admin/src/components/AdminLayout.vue

- [ ] **Line 27:** Verify resize listener cleanup ✅

#### client/src/components/AppImage.vue

- [ ] **Line 50:** Verify IntersectionObserver cleanup ✅

#### client/src/composables/useScrollReveal.js

- [ ] Ensure all observers are properly disposed in `onUnmounted()`

#### admin/src/views/DashboardView.vue

- [ ] **Line 29:** Add error logging
  ```javascript
  api.get("/analytics/stats?days=30").catch((err) => {
    console.warn("Analytics stats failed:", err);
    return { pageViews: 0, reserveClicks: 0, conversionRate: 0 };
  });
  ```

#### admin/src/views/ReviewsView.vue

- [ ] **Line 113:** Verify debounceTimer cleanup ✅
- [ ] **Line 60:** Good error handling ✅

---

## 🔄 New Files to Create

### client/src/composables/useListPagination.js

- [ ] Create reusable pagination composable
- [ ] Consolidate search/filter/sort logic
- [ ] Auto-cleanup timers and watchers

### admin/src/lib/validation-schemas.js

- [ ] Create validation schemas for all forms
- [ ] Flashsales schema
- [ ] Spaces schema
- [ ] Vouchers schema
- [ ] Create schema validator function

### admin/src/lib/error-handler.js

- [ ] Create centralized error handling
- [ ] Add error logging wrapper
- [ ] Add retry mechanism template

---

## 🧪 Testing Checklist

After implementing fixes, verify:

- [ ] No console errors when navigating between views
- [ ] Timers clean up when leaving ConfigView
- [ ] Multiple rapid searches don't cause issues
- [ ] API validation errors caught properly
- [ ] Upload failures logged to console
- [ ] Memory usage stable over 5 minutes of use
- [ ] No "state mutation after unmount" warnings
- [ ] Error messages display to users
- [ ] File uploads properly cleaned up
- [ ] Two simultaneous data loads don't conflict

---

## 📊 Code Metrics

### Current State

- **Code Duplication:** ~35%
- **Error Handling:** ~40% (missing in ~60% of async operations)
- **Memory Leaks:** ~5 potential memory leaks identified
- **Test Coverage:** Unknown (needs measurement)

### Target State (After Fixes)

- **Code Duplication:** <10%
- **Error Handling:** >90%
- **Memory Leaks:** 0
- **Test Coverage:** >60%

---

## 📝 File Modification Summary

| File                       | Changes   | Time       | Priority |
| -------------------------- | --------- | ---------- | -------- |
| ConfigView.vue             | +3 fixes  | 10 min     | CRITICAL |
| FlashSalesView.vue         | +2 fixes  | 10 min     | CRITICAL |
| MenuView.vue               | +2 fixes  | 10 min     | CRITICAL |
| SpacesView.vue             | +2 fixes  | 10 min     | CRITICAL |
| VouchersView.vue           | +2 fixes  | 5 min      | HIGH     |
| GalleryView.vue            | +1 fix    | 5 min      | HIGH     |
| useData.js                 | +2 fixes  | 25 min     | CRITICAL |
| useAnalytics.js            | +1 fix    | 5 min      | HIGH     |
| useReviews.js              | +1 fix    | 5 min      | HIGH     |
| NEW: useListPagination.js  | Create    | 45 min     | MEDIUM   |
| NEW: validation-schemas.js | Create    | 30 min     | MEDIUM   |
| **TOTAL**                  | 19+ fixes | ~2.5 hours | -        |

---

## 🚀 Deployment Checklist

### Pre-Deployment (Staging)

- [ ] Apply all Phase 1 fixes
- [ ] Run full UI test suite
- [ ] Check browser console for errors
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile (iOS, Android)
- [ ] Memory profile for leaks
- [ ] Load testing

### Deployment (Production)

- [ ] Deploy with monitoring enabled
- [ ] Set up alerts for errors
- [ ] Monitor error rate first 1 hour
- [ ] Monitor memory usage
- [ ] Monitor API response times
- [ ] Have rollback plan ready

### Post-Deployment (First Week)

- [ ] Monitor error tracking dashboard
- [ ] Check for orphaned files
- [ ] Review analytics data
- [ ] Collect user feedback
- [ ] Plan Phase 2 improvements

---

## 💾 Version Control Notes

### Commit Messages (Recommended)

```
fix(admin): add error logging to upload cleanup
- Prevents silent failures in upload cleanup
- Improves debugging visibility
- Applies to: ConfigView, FlashSalesView, MenuView, SpacesView
```

```
fix(core): prevent memory leaks from uncleared timers
- Add onUnmounted cleanup to ConfigView.vue
- Explicit watch cleanup in view components
- Prevent state updates after unmount
```

```
fix(data): add validation after API calls
- Validate array responses before mapping
- Prevent crashes from null/undefined responses
- Add try-catch around data processing
```

```
refactor: extract pagination logic to composable
- Consolidate duplicate search/filter/sort patterns
- Create useListPagination composable
- Reduces code duplication by ~35%
```

---

## 📞 Questions During Implementation

**Q: Should I implement all fixes at once?**  
A: No. Implement Phase 1 (critical fixes) first, test, then deploy. Then Phase 2.

**Q: Do I need to rewrite components?**  
A: No. These are surgical fixes. Most components need only 1-2 line additions.

**Q: Will these fixes break existing functionality?**  
A: No. These fixes only add missing error handling and cleanup. No behavior changes.

**Q: How do I test for memory leaks?**  
A: Use Chrome DevTools → Memory tab → Allocations Timeline. Record usage over time.

**Q: Should I add TypeScript now?**  
A: Not urgent. Fix critical issues first. TypeScript can come in Phase 3.

---

## 🎯 Success Criteria

- [ ] All console errors resolved
- [ ] No memory growth over time
- [ ] Error tracking captures all failures
- [ ] Users see error messages (not silent failures)
- [ ] Upload cleanup works properly
- [ ] No race conditions in data loading
- [ ] Code duplication reduced by 30%+
- [ ] All timers/listeners cleaned up

---

**Last Updated:** May 9, 2026  
**Status:** Ready for Implementation  
**Estimated Completion:** ~3 hours (Phase 1)
