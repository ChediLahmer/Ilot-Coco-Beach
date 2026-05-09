import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import { trackPageView } from "@/composables/useAnalytics";
import "./styles/main.css";

const app = createApp(App);
app.use(router);
app.use(i18n);

// Track page views on route changes
router.afterEach((to) => {
  // Ensure tracking completes on mobile with sendBeacon
  trackPageView(to.path);
});

app.mount("#app");
