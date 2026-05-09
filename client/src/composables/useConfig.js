import { reactive } from "vue";
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
  sectionVideo: "",
  sectionPoster: "",
  showReviews: false,
  satisfactionRate: "",
  aboutImage1: "",
  aboutImage2: "",
  loaded: false,
});

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
  section_video_url: "sectionVideo",
  section_poster_url: "sectionPoster",
  show_reviews: "showReviews",
  satisfaction_rate: "satisfactionRate",
  about_image_1: "aboutImage1",
  about_image_2: "aboutImage2",
};

let loaded = false;
let configError = false;

async function loadConfig() {
  if (loaded) return;
  loaded = true;
  configError = false;
  try {
    const data = await api.getConfig();
    if (data && typeof data === "object") {
      for (const [apiKey, localKey] of Object.entries(KEY_MAP)) {
        if (data[apiKey] != null) {
          config[localKey] =
            localKey === "showReviews" ? data[apiKey] === "true" : data[apiKey];
        }
      }
    }
  } catch {
    configError = true;
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
