import { reactive } from 'vue'

const config = reactive({
  name: import.meta.env.VITE_BUSINESS_NAME || 'Ilot Coco Beach',
  phone: import.meta.env.VITE_BUSINESS_PHONE || '+216 99 123 456',
  whatsapp: import.meta.env.VITE_BUSINESS_WHATSAPP || '21699123456',
  email: import.meta.env.VITE_BUSINESS_EMAIL || 'contact@ilotcocobeach.com',
  address: import.meta.env.VITE_BUSINESS_ADDRESS || 'Ghar El Melh, Bizerte, Tunisie',
  lat: import.meta.env.VITE_BUSINESS_LATITUDE || '37.1476125',
  lng: import.meta.env.VITE_BUSINESS_LONGITUDE || '10.2133906',
  instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/ilotcocobeach',
  facebook: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/IlotCocoBeach',
})

export function useConfig() {
  return config
}
