<script setup>
import { Switch } from "@headlessui/vue";

defineProps({ modelValue: Boolean });
defineEmits(["update:modelValue"]);
</script>

<template>
  <Switch
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    class="relative inline-flex h-[1.375rem] w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
    :class="modelValue ? 'bg-success' : 'bg-slate-300'"
  >
    <span
      class="pointer-events-none inline-block h-[1.125rem] w-[1.125rem] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
      :class="modelValue ? 'translate-x-[1.125rem]' : 'translate-x-0'"
    />
  </Switch>
</template>
