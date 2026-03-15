<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { emplacements } from '@/data/mock.js'

gsap.registerPlugin(ScrollTrigger)

const { t, locale } = useI18n()

const scrollContainer = ref(null)
const showLeftArrow = ref(false)
const showRightArrow = ref(true)

function handleScroll() {
  if (!scrollContainer.value) return
  const el = scrollContainer.value
  showLeftArrow.value = el.scrollLeft > 20
  showRightArrow.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 20
}

function scrollTo(direction) {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({ left: direction * 360, behavior: 'smooth' })
}

let ctx
onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.exp-card', {
      x: 60,
      opacity: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#experience',
        start: 'top 75%',
      },
    })
  })
})
onUnmounted(() => { if (ctx) ctx.revert() })
</script>

<template>
  <section id="experience" class="py-20 px-6 md:px-16 bg-sand sand-texture">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="font-display text-ocean text-4xl md:text-5xl">{{ t('experience.title') }}</h2>
        <p class="mt-3 text-charcoal/60 text-lg">{{ t('experience.subtitle') }}</p>
      </div>

      <div class="relative">
        <!-- Scroll arrows -->
        <button
          v-if="showLeftArrow"
          @click="scrollTo(-1)"
          class="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center text-ocean hover:bg-ocean hover:text-white transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button
          v-if="showRightArrow"
          @click="scrollTo(1)"
          class="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full items-center justify-center text-ocean hover:bg-ocean hover:text-white transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>

        <!-- Cards -->
        <div
          ref="scrollContainer"
          @scroll="handleScroll"
          class="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:flex-row flex-col md:overflow-x-auto overflow-visible"
          style="scrollbar-width: none; -ms-overflow-style: none;"
        >
          <div
            v-for="emp in emplacements"
            :key="emp.id"
            class="exp-card min-w-[300px] max-w-[340px] md:min-w-[320px] md:max-w-[380px] flex-shrink-0 snap-start bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
            style="perspective: 800px;"
          >
            <div class="relative h-56 overflow-hidden">
              <img
                :src="emp.image"
                :alt="emp.name[locale]"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute top-3 right-3 bg-ocean/90 text-white px-3 py-1 rounded-full text-sm font-bold">
                {{ emp.price }} DT
              </div>
              <div class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-charcoal">
                <svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {{ emp.capacity }} {{ t('experience.persons') }}
              </div>
            </div>
            <div class="p-5">
              <h3 class="font-heading font-bold text-lg text-charcoal">{{ emp.name[locale] }}</h3>
              <p class="text-sm text-charcoal/60 mt-2 leading-relaxed">{{ emp.desc[locale] }}</p>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-ocean font-bold text-lg">{{ emp.price }} DT <span class="text-xs font-normal text-charcoal/50">/ {{ t('experience.perPerson') }}</span></span>
                <a href="#reservation" class="text-sm bg-coral text-white px-4 py-2 rounded-full hover:scale-105 transition font-semibold">
                  {{ t('reservation.whatsapp').split(' ')[0] }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<style scoped>
.exp-card:hover {
  transform: perspective(800px) rotateY(2deg);
}
div::-webkit-scrollbar {
  display: none;
}
</style>
