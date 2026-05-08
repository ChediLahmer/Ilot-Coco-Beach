<template>
  <!-- Mobile: WhatsApp only -->
  <a
    :href="'https://wa.me/' + config.whatsapp"
    target="_blank"
    rel="noopener"
    title="WhatsApp"
    class="fixed bottom-20 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg whatsapp-pulse lg:hidden"
  >
    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  </a>

  <!-- Desktop: Full FAB -->
  <div
    class="fixed bottom-6 end-6 z-50 hidden flex-col items-end gap-3 lg:flex"
  >
    <!-- Expanded buttons -->
    <Transition name="social-buttons">
      <div v-if="open" class="flex flex-col gap-3">
        <!-- WhatsApp -->
        <a
          :href="'https://wa.me/' + config.whatsapp"
          target="_blank"
          rel="noopener"
          title="WhatsApp"
          class="w-11 h-11 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 whatsapp-pulse"
        >
          <svg
            class="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
            />
          </svg>
        </a>
        <!-- Instagram -->
        <a
          :href="config.instagram"
          target="_blank"
          rel="noopener"
          title="Instagram"
          class="w-11 h-11 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
          style="
            background: linear-gradient(
              45deg,
              #f09433,
              #e6683c,
              #dc2743,
              #cc2366,
              #bc1888
            );
          "
        >
          <svg
            class="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
            />
          </svg>
        </a>
        <!-- Messenger -->
        <a
          :href="messengerUrl"
          target="_blank"
          rel="noopener"
          title="Messenger"
          class="w-11 h-11 bg-[#0084FF] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
        >
          <svg
            class="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.2.16.15.26.36.27.59l.05 1.85c.02.62.67 1.03 1.23.78l2.07-.91c.17-.08.37-.1.55-.06.9.25 1.87.38 2.88.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm5.89 7.5l-2.89 4.58c-.46.73-1.44.91-2.13.39l-2.3-1.72a.72.72 0 00-.86 0l-3.1 2.35c-.41.31-.95-.18-.68-.62l2.89-4.58c.46-.73 1.44-.91 2.13-.39l2.3 1.72a.72.72 0 00.86 0l3.1-2.35c.41-.31.95.18.68.62z"
            />
          </svg>
        </a>
        <!-- TikTok -->
        <a
          v-if="config.tiktok"
          :href="config.tiktok"
          target="_blank"
          rel="noopener"
          title="TikTok"
          class="w-11 h-11 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
        >
          <svg
            class="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.41a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.14z"
            />
          </svg>
        </a>
      </div>
    </Transition>

    <!-- Toggle FAB -->
    <button
      :class="[
        'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300',
        open ? 'bg-ocean/80 rotate-45' : 'bg-ocean hover:bg-ocean/80',
      ]"
      @click="open = !open"
      title="Contact"
    >
      <svg
        v-if="!open"
        class="w-5 h-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <svg
        v-else
        class="w-5 h-5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useConfig } from "@/composables/useConfig";

const config = useConfig();
const open = ref(false);

const messengerUrl = computed(() => {
  if (!config.facebook) return "#";
  const fbId = config.facebook.split("/").filter(Boolean).pop();
  return `https://m.me/${fbId}`;
});
</script>

<style scoped>
.social-buttons-enter-active,
.social-buttons-leave-active {
  transition: all 0.25s ease;
}
.social-buttons-enter-from,
.social-buttons-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
