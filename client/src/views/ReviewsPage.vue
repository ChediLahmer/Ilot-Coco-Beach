<template>
  <div class="min-h-screen bg-sand">
    <NavBar />

    <section
      class="relative overflow-hidden px-6 pb-16 pt-[7.5rem] md:px-16 md:pb-20 md:pt-[8.5rem]"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,93,74,0.10),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(32,178,170,0.10),transparent_28%)]"
      />
      <div class="sand-texture absolute inset-0 opacity-40" />

      <div class="relative z-10 mx-auto max-w-7xl">
        <router-link
          to="/"
          class="inline-flex items-center gap-2 text-sm font-heading font-semibold uppercase tracking-[0.16em] text-charcoal/45 hover:text-coral"
        >
          <svg
            class="h-4 w-4 rtl-flip"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {{ copy.backHome }}
        </router-link>

        <div class="mt-8 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p class="section-kicker">{{ t("reviews.eyebrow") }}</p>
            <h1 class="section-title mt-6">{{ copy.title }}</h1>
            <div class="section-divider" />
            <p class="section-copy mt-8 max-w-xl">
              {{ copy.subtitle }}
            </p>

            <div class="mt-10 grid gap-4 sm:grid-cols-2">
              <article class="premium-card rounded-[1.75rem] p-6">
                <p
                  class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65"
                >
                  {{ t("reviews.ratingLabel") }}
                </p>
                <p class="mt-4 font-brand text-5xl text-deep">
                  {{ averageRating }}
                </p>
                <p class="mt-2 text-sm text-charcoal/60">
                  {{ reviews.length }} {{ t("reviews.reviewsLabel") }}
                </p>
              </article>

              <article class="premium-card rounded-[1.75rem] p-6">
                <p
                  class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-ocean/65"
                >
                  {{ t("reviews.recommendationLabel") }}
                </p>
                <p class="mt-4 font-brand text-5xl text-deep">
                  {{ recommendationRate }}%
                </p>
                <p class="mt-2 text-sm text-charcoal/60">
                  {{ t("reviews.recommendationText") }}
                </p>
              </article>
            </div>

            <div class="premium-card mt-8 rounded-[1.75rem] p-6 sm:p-8">
              <p
                class="font-heading text-[0.68rem] font-bold uppercase tracking-[0.22em] text-coral/80"
              >
                {{ copy.formTitle }}
              </p>
              <p class="mt-3 text-sm leading-7 text-charcoal/58">
                {{ copy.formSubtitle }}
              </p>

              <form class="mt-6 space-y-5" @submit.prevent="submitReview">
                <div>
                  <label
                    class="mb-3 block text-xs font-heading font-bold uppercase tracking-[0.18em] text-charcoal/48"
                  >
                    {{ copy.nameLabel }}
                  </label>
                  <input
                    v-model="form.userName"
                    type="text"
                    required
                    maxlength="100"
                    :placeholder="copy.namePlaceholder"
                    class="booking-field"
                  />
                </div>

                <div>
                  <p
                    class="mb-3 block text-xs font-heading font-bold uppercase tracking-[0.18em] text-charcoal/48"
                  >
                    {{ copy.ratingLabel }}
                  </p>
                  <div class="flex items-center gap-2">
                    <button
                      v-for="star in 5"
                      :key="star"
                      type="button"
                      class="text-3xl p-1 min-w-[44px] min-h-[44px] flex items-center justify-center transition-transform duration-200 hover:scale-110"
                      :class="
                        star <= form.rating ? 'text-coral' : 'text-charcoal/18'
                      "
                      @click="form.rating = star"
                    >
                      ★
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    class="mb-3 block text-xs font-heading font-bold uppercase tracking-[0.18em] text-charcoal/48"
                  >
                    {{ copy.commentLabel }}
                  </label>
                  <textarea
                    v-model="form.comment"
                    rows="5"
                    required
                    maxlength="2000"
                    :placeholder="copy.commentPlaceholder"
                    class="booking-field resize-none"
                  />
                </div>

                <div class="flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    :disabled="submitting"
                    class="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-sunset),var(--color-gold))] px-6 py-3 font-heading text-[0.76rem] font-bold uppercase tracking-[0.16em] text-white shadow-[0_16px_34px_rgba(255,123,58,0.22)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ submitting ? "..." : copy.submit }}
                  </button>

                  <p v-if="successMessage" class="text-sm text-leaf">
                    {{ successMessage }}
                  </p>
                  <p v-if="formError" class="text-sm text-red-500">
                    {{ formError }}
                  </p>
                </div>
              </form>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <article
              v-for="review in reviews"
              :key="review.id"
              class="premium-card flex min-h-[18rem] flex-col rounded-[1.75rem] p-6"
            >
              <div class="flex gap-0.5 text-coral">
                <span v-for="star in 5" :key="star">
                  {{ star <= review.rating ? "★" : "☆" }}
                </span>
              </div>

              <p class="mt-5 flex-1 text-base leading-8 text-charcoal/72">
                “{{ review.comment }}”
              </p>

              <div class="mt-8 border-t border-charcoal/8 pt-5">
                <p class="font-heading text-base font-semibold text-deep">
                  {{ review.userName }}
                </p>
                <p class="mt-1 text-sm text-charcoal/45">
                  {{ formatDate(review.createdAt) }}
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <FooterSection />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

import FooterSection from "@/components/FooterSection.vue";
import NavBar from "@/components/NavBar.vue";
import { useReviews } from "@/composables/useReviews";

const { locale, t } = useI18n();
const { reviews, averageRating, recommendationRate, addReview } = useReviews();

const form = reactive({
  userName: "",
  rating: 5,
  comment: "",
});

const successMessage = ref("");
const formError = ref("");
const submitting = ref(false);

const copy = computed(
  () =>
    ({
      fr: {
        title: "Les avis de nos visiteurs",
        subtitle:
          "Consultez les retours clients et partagez votre propre expérience de Coco Beach.",
        formTitle: "Laisser un avis",
        formSubtitle:
          "Ajoutez votre note et quelques mots pour aider les prochains visiteurs.",
        nameLabel: "Votre nom",
        namePlaceholder: "Entrez votre prénom ou nom",
        ratingLabel: "Votre note",
        commentLabel: "Votre avis",
        commentPlaceholder:
          "Racontez votre expérience, votre table préférée ou votre plat marquant…",
        submit: "Publier mon avis",
        success: "Merci, votre avis a bien été ajouté.",
        backHome: "Retour à l’accueil",
      },
      en: {
        title: "Guest reviews",
        subtitle:
          "Browse recent guest feedback and share your own Coco Beach experience.",
        formTitle: "Leave a review",
        formSubtitle: "Add your rating and a few words to help future guests.",
        nameLabel: "Your name",
        namePlaceholder: "Enter your name",
        ratingLabel: "Your rating",
        commentLabel: "Your review",
        commentPlaceholder:
          "Tell us about your experience, favorite spot or signature dish…",
        submit: "Publish review",
        success: "Thank you, your review was added.",
        backHome: "Back to home",
      },
      ar: {
        title: "آراء الزوار",
        subtitle: "اطلع على تقييمات الضيوف وشارك تجربتك الخاصة في كوكو بيتش.",
        formTitle: "أضف رأيك",
        formSubtitle: "أضف تقييمك وبعض الكلمات لمساعدة الزوار القادمين.",
        nameLabel: "الاسم",
        namePlaceholder: "أدخل اسمك",
        ratingLabel: "التقييم",
        commentLabel: "رأيك",
        commentPlaceholder:
          "احكِ لنا عن تجربتك أو طاولتك المفضلة أو طبقك المفضل…",
        submit: "نشر التقييم",
        success: "شكراً، تمت إضافة رأيك بنجاح.",
        backHome: "العودة للرئيسية",
      },
    })[locale.value] || {
      title: "Les avis de nos visiteurs",
      subtitle:
        "Consultez les retours clients et partagez votre propre expérience de Coco Beach.",
      formTitle: "Laisser un avis",
      formSubtitle:
        "Ajoutez votre note et quelques mots pour aider les prochains visiteurs.",
      nameLabel: "Votre nom",
      namePlaceholder: "Entrez votre prénom ou nom",
      ratingLabel: "Votre note",
      commentLabel: "Votre avis",
      commentPlaceholder:
        "Racontez votre expérience, votre table préférée ou votre plat marquant…",
      submit: "Publier mon avis",
      success: "Merci, votre avis a bien été ajouté.",
      backHome: "Retour à l’accueil",
    },
);

const errorCopy = computed(
  () =>
    ({
      fr: {
        name: "Veuillez saisir votre nom (au moins 2 caractères).",
        commentEmpty: "Veuillez saisir un commentaire.",
        commentShort: "Votre avis doit contenir au moins 10 caractères.",
        rateLimit: "Trop de tentatives. Veuillez patienter une minute.",
        send: "Erreur lors de l'envoi de votre avis. Réessayez.",
      },
      en: {
        name: "Please enter your name (at least 2 characters).",
        commentEmpty: "Please enter a comment.",
        commentShort: "Your review must be at least 10 characters long.",
        rateLimit: "Too many attempts. Please wait a minute.",
        send: "Error sending your review. Please try again.",
      },
      ar: {
        name: "يرجى إدخال اسمك (حرفين على الأقل).",
        commentEmpty: "يرجى إدخال تعليق.",
        commentShort: "يجب أن يكون تعليقك 10 أحرف على الأقل.",
        rateLimit: "محاولات كثيرة. يرجى الانتظار دقيقة.",
        send: "خطأ في إرسال رأيك. حاول مرة أخرى.",
      },
    })[locale.value] || {
      name: "Veuillez saisir votre nom (au moins 2 caractères).",
      commentEmpty: "Veuillez saisir un commentaire.",
      commentShort: "Votre avis doit contenir au moins 10 caractères.",
      rateLimit: "Trop de tentatives. Veuillez patienter une minute.",
      send: "Erreur lors de l'envoi de votre avis. Réessayez.",
    },
);

async function submitReview() {
  formError.value = "";
  successMessage.value = "";

  const name = form.userName.trim();
  const comment = form.comment.trim();

  if (!name || name.length < 2) {
    formError.value = errorCopy.value.name;
    return;
  }
  if (!comment) {
    formError.value = errorCopy.value.commentEmpty;
    return;
  }
  if (comment.length < 10) {
    formError.value = errorCopy.value.commentShort;
    return;
  }

  submitting.value = true;
  try {
    await addReview({
      userName: name,
      comment,
      rating: form.rating,
    });
  } catch (e) {
    if (e.message && e.message.includes("429")) {
      formError.value = errorCopy.value.rateLimit;
    } else {
      formError.value = errorCopy.value.send;
    }
    return;
  } finally {
    submitting.value = false;
  }

  form.userName = "";
  form.comment = "";
  form.rating = 5;
  successMessage.value = copy.value.success;

  window.setTimeout(() => {
    successMessage.value = "";
  }, 2800);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale.value, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
</script>
