import { reactive } from "vue";
import { api } from "@/lib/supabase";

const config = reactive({
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  lat: "",
  lng: "",
  instagram: "",
  facebook: "",
  messenger: "",
  hours: "",
  heroVideo: "",
  heroPoster: "",
  aboutText: "",
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
  hours: "hours",
  hero_video_url: "heroVideo",
  hero_poster_url: "heroPoster",
  about_text: "aboutText",
};

let loaded = false;

async function loadConfig() {
  if (loaded) return;
  loaded = true;
  try {
    const data = await api.getConfig();
    if (data && typeof data === "object") {
      for (const [apiKey, localKey] of Object.entries(KEY_MAP)) {
        if (data[apiKey]) config[localKey] = data[apiKey];
      }
    }
  } catch {
    /* keep empty until backend responds */
  }
  config.loaded = true;
}

loadConfig();

export function useConfig() {
  return config;
}
