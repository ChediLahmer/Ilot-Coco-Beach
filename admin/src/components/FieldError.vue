<template>
  <p v-if="message" class="mt-1 text-xs text-danger">{{ message }}</p>
</template>

<script setup>
defineProps({ message: String });
</script>
