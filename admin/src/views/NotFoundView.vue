<template>
  <div class="min-h-screen bg-bg flex items-center justify-center px-6">
    <div class="text-center max-w-md">
      <p class="text-8xl font-bold text-primary/20">404</p>
      <h1 class="mt-4 text-xl font-bold text-text">Page introuvable</h1>
      <p class="mt-3 text-sm text-text-muted">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <router-link
        to="/"
        class="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
      >
        Retour au tableau de bord
      </router-link>
    </div>
  </div>
</template>
