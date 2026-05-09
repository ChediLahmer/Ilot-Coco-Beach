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
  about_image_1: "aboutImage1",
  about_image_2: "aboutImage2",
};

let loaded = false;

async function loadConfig() {
  if (loaded) return;
  loaded = true;
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
    /* keep empty until backend responds */
  }
  config.loaded = true;
}

export const configReady = loadConfig();

export function useConfig() {
  return config;
}
