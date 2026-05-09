/**
 * Device detection and responsive utilities for admin
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
