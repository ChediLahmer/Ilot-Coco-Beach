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

// Mobile optimizations and device detection
if (typeof window !== "undefined") {
  // Enhanced device detection
  const detectDevice = () => {
    const ua = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;

    // Mobile detection
    const isMobileUA =
      /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isMobileSize = screenWidth < 768;

    // Tablet detection
    const isTabletUA = /ipad|android(?!.*mobile)|kindle|playbook|silk/i.test(
      ua,
    );
    const isTabletSize = screenWidth >= 768 && screenWidth < 1024;

    if (isMobileUA || isMobileSize) {
      return {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        type: "mobile",
      };
    }
    if (isTabletUA || isTabletSize) {
      return {
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        type: "tablet",
      };
    }
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      type: "desktop",
    };
  };

  // Store device detection on window
  const device = detectDevice();
  window.deviceInfo = device;

  // Set device type in root element
  document.documentElement.setAttribute("data-device", device.type);

  // Handle viewport height on mobile (address bar changes)
  const handleViewportChange = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  handleViewportChange();
  window.addEventListener("resize", handleViewportChange, { passive: true });
  window.addEventListener("orientationchange", handleViewportChange, {
    passive: true,
  });

  // Prevent iOS bounce scroll (address bar interactions)
  if (device.isMobile || device.isTablet) {
    document.addEventListener(
      "touchmove",
      (e) => {
        // Allow scrolling within specific containers
        if (
          !e.target.closest(".scrollable-container, input, textarea, select")
        ) {
          const touch = e.touches[0];
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight;
          const winHeight = window.innerHeight;

          // Only prevent bounce at boundaries
          if (
            (scrollTop === 0 && touch.clientY > 0) ||
            (scrollTop + winHeight >= docHeight && touch.clientY < 0)
          ) {
            // Allow natural scroll at boundaries
          }
        }
      },
      { passive: true },
    );
  }

  // Disable double-tap zoom on buttons/links (faster tap response)
  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false },
  );
}

app.mount("#app");
