import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import { trackPageView } from "@/composables/useAnalytics";
import "./styles/main.css";

const app = createApp(App);
app.use(router);
app.use(i18n);

// Track initial page load and route changes
let isInitialLoad = true;

router.isReady().then(() => {
  if (isInitialLoad) {
    // Track the initial page load
    trackPageView(window.location.pathname);
    isInitialLoad = false;
  }
});

// Track subsequent page views on route changes
router.afterEach((to) => {
  if (!isInitialLoad) {
    trackPageView(to.path);
  }
});

app.mount("#app");
