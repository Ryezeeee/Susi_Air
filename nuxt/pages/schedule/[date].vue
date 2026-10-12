<script setup lang="ts">
const route = useRoute();
const date = computed(() => String(route.params.date));
const valid = computed(() => /^\d{4}-\d{2}-\d{2}$/.test(date.value));
useHead({ title: 'Duty detail · Susi Air Pilot' });
</script>

<template>
  <UiComingSoon :title="valid ? formatDayLabel(date) : 'Duty detail'" subtitle="Detail page coming soon" back="/schedule">
    Flight legs and logbook entries for this day will appear here.
  </UiComingSoon>
</template>
