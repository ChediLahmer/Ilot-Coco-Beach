import { reactive, ref } from "vue";
import { api } from "@/lib/supabase";

const config = reactive({
  name: "Ilot Coco Beach",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  lat: "",
  lng: "",
  instagram: "",
  facebook: "",
  messenger: "",
  tiktok: "",
  hours: "",
  heroVideo: "",
  heroPoster: "",
  spacesHeroImage: "",
  sectionVideo: "",
  sectionPoster: "",
  showReviews: false,
  satisfactionRate: "",
  aboutImage1: "",
  aboutImage2: "",
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
  galleryHero: "",
  loaded: false,
});

const VIDEO_KEYS = new Set(["heroVideo", "sectionVideo"]);

function unwrapVideoUrl(value) {
  if (typeof value !== "string") return value;
  try {
    const url = new URL(value);
    const nested = url.searchParams.get("url");
    if (nested && url.pathname.endsWith("/media/proxy")) {
      const decoded = decodeURIComponent(nested);
      // Keep incoming videos proxied to avoid R2 range-request CORS failures.
      if (decoded.includes("/incoming/")) return value;
      return decoded;
    }
  } catch {
    // not a URL, return as-is
  }
  return value;
}

const KEY_MAP = {
  name: "name",
  phone: "phone",
  whatsapp: "whatsapp",
  email: "email",
  address: "address",
  lat: "lat",
  lng: "lng",
  instagram: "instagram",
  facebook: "facebook",
  messenger: "messenger",
  tiktok: "tiktok",
  hours: "hours",
  hero_video_url: "heroVideo",
  hero_poster_url: "heroPoster",
  spaces_hero_image_url: "spacesHeroImage",
  section_video_url: "sectionVideo",
  section_poster_url: "sectionPoster",
  show_reviews: "showReviews",
  satisfaction_rate: "satisfactionRate",
  about_image_1: "aboutImage1",
  about_image_2: "aboutImage2",
  seo_title: "seoTitle",
  seo_description: "seoDescription",
  og_image: "ogImage",
  gallery_hero_url: "galleryHero",
};

let loaded = false;
const configError = ref(false);

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}

async function loadConfig() {
  if (loaded) return;
  loaded = true;
  configError.value = false;
  try {
    const data = await api.getConfig();
    if (data && typeof data === "object") {
      for (const [apiKey, localKey] of Object.entries(KEY_MAP)) {
        if (data[apiKey] != null) {
          if (localKey === "showReviews") {
            config[localKey] = data[apiKey] === "true" || data[apiKey] === true;
          } else if (localKey === "lat" || localKey === "lng") {
            config[localKey] = toNumber(data[apiKey]);
          } else {
            config[localKey] = VIDEO_KEYS.has(localKey)
              ? unwrapVideoUrl(data[apiKey])
              : data[apiKey];
          }
        }
      }
    }
  } catch {
    configError.value = true;
  }
  config.loaded = true;
}

export const configReady = loadConfig();

export function useConfig() {
  return config;
}

export function retryConfig() {
  loaded = false;
  config.loaded = false;
  return loadConfig();
}

export function useConfigStatus() {
  return {
    error: configError,
  };
}
