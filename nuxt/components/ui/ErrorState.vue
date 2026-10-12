<script setup lang="ts">
import { AlertTriangle, RotateCw } from 'lucide-vue-next';
defineProps<{ message: string }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="error-state" role="alert">
    <AlertTriangle :size="18" />
    <p>{{ message }}</p>
    <button type="button" @click="$emit('retry')"><RotateCw :size="14" /> Retry</button>
  </div>
</template>

<style lang="scss" scoped>
.error-state {
  @include card;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  color: $danger;
  font-size: 13px;

  p {
    flex: 1;
    color: $text;
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 1px solid $border;
    background: $surface;
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
  }
}
</style>
