<script setup>
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "Date et heure",
  },
  hint: {
    type: String,
    default: "Format: DD/MM/YYYY, heure future requise",
  },
  error: {
    type: String,
    default: null,
  },
  required: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);

const formatDateTime = (iso) => {
  if (!iso) return { date: "", time: "" };
  // Handle full ISO strings like "2026-08-31T00:00:00.000Z" or "2026-08-31T00:00"
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (!match) return { date: "", time: "" };
  return { date: match[1], time: match[2] || "12:00" };
};

const updateDateTime = (emit, modelValue) => (type, value) => {
  const current = modelValue || "";
  const { date, time } = formatDateTime(current);

  if (type === "date") {
    emit("update:modelValue", value ? `${value}T${time}` : "");
  } else if (type === "time") {
    emit("update:modelValue", date ? `${date}T${value}` : "");
  }
};
</script>

<template>
  <div>
    <label class="block text-xs font-medium text-text-muted mb-2"
      >{{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <div class="grid grid-cols-2 gap-2">
      <div>
        <span class="text-[0.7rem] text-text-muted/70 mb-1 block">Date</span>
        <input
          :value="formatDateTime(modelValue).date"
          @input="
            updateDateTime($emit, modelValue)('date', $event.target.value)
          "
          type="date"
          class="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
          :class="error ? 'border-danger' : 'border-border'"
        />
      </div>
      <div>
        <span class="text-[0.7rem] text-text-muted/70 mb-1 block">Heure</span>
        <input
          :value="formatDateTime(modelValue).time"
          @input="
            updateDateTime($emit, modelValue)('time', $event.target.value)
          "
          type="time"
          class="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
          :class="error ? 'border-danger' : 'border-border'"
        />
      </div>
    </div>
    <p class="text-xs text-text-muted mt-1.5">{{ hint }}</p>
    <p v-if="error" class="text-xs text-danger mt-1">{{ error }}</p>
  </div>
</template>
