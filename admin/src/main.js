import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router.js";
import { useDevice } from "@/composables/useDevice";
import "./style.css";

// Device detection and smart redirect
if (typeof window !== "undefined") {
  const device = useDevice();

  // Suggest mobile users to use the app, but allow them to continue in admin
  if (device.isMobile) {
    const adminConsent = localStorage.getItem("admin_mobile_consent");
    if (!adminConsent) {
      // Store that they've acknowledged the mobile warning
      localStorage.setItem("admin_mobile_consent", "true");
      // Optional: Show a banner that admin is optimized for desktop
      // Users can still use it but should know it's not ideal for mobile
    }
  }

  // Mobile-specific optimizations
  document.documentElement.style.setProperty(
    "--device-type",
    device.deviceType,
  );

  // Handle orientation changes
  window.addEventListener("orientationchange", () => {
    // Reflow layout on orientation change
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  });

  // Store device info globally for components
  window.deviceInfo = device;
}

const app = createApp(App);
app.use(router).mount("#app");
