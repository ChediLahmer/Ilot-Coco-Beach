/**
 * Device detection and responsive utilities
 */

export function useDevice() {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: "desktop",
      screenWidth: 1024,
      screenHeight: 768,
    };
  }

  // Detect device type based on user agent and screen size
  const detectDeviceType = () => {
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

    // Final device type determination
    if (isMobileUA || isMobileSize) {
      return {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        deviceType: "mobile",
      };
    }

    if (isTabletUA || isTabletSize) {
      return {
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        deviceType: "tablet",
      };
    }

    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: "desktop",
    };
  };

  const getScreenSize = () => {
    if (typeof window === "undefined") {
      return { width: 0, height: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  const getBreakpoint = () => {
    const width = window.innerWidth;
    if (width < 640) return "xs";
    if (width < 768) return "sm";
    if (width < 1024) return "md";
    if (width < 1280) return "lg";
    if (width < 1536) return "xl";
    return "2xl";
  };

  const deviceInfo = detectDeviceType();
  const screenSize = getScreenSize();
  const breakpoint = getBreakpoint();

  return {
    ...deviceInfo,
    screenWidth: screenSize.width,
    screenHeight: screenSize.height,
    breakpoint,
    isSmallScreen: screenSize.width < 640,
    isMediumScreen: screenSize.width >= 640 && screenSize.width < 1024,
    isLargeScreen: screenSize.width >= 1024,
  };
}

/**
 * Determine if user should be redirected based on device type
 */
export function shouldRedirectToApp(deviceType) {
  // Redirect mobile users to app
  // Check localStorage for "force_web" to allow desktop version on mobile if user prefers
  const forceWeb = localStorage.getItem("force_web_mode");
  return deviceType === "mobile" && !forceWeb;
}

/**
 * Get app URL (client) or admin URL based on device
 */
export function getRedirectUrl(deviceType, currentPath = "") {
  if (typeof window === "undefined") return "";

  const appUrl = import.meta.env.VITE_CLIENT_URL || "http://localhost:5173";
  const adminUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5174";

  if (deviceType === "mobile") {
    // Redirect mobile to client app
    return appUrl + (currentPath || "/");
  }

  // Desktop/Tablet can choose, default to admin for admin panel
  if (window.location.pathname.includes("/admin")) {
    return adminUrl + currentPath;
  }

  return appUrl + (currentPath || "/");
}
