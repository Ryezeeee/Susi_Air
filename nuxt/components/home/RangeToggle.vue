<script setup lang="ts">
import { RANGE_KEYS, type RangeKey } from '~/types/api';

const model = defineModel<RangeKey>({ required: true });
</script>

<template>
  <div class="toggle" role="radiogroup" aria-label="Chart range">
    <button
      v-for="key in RANGE_KEYS"
      :key="key"
      type="button"
      role="radio"
      :aria-checked="model === key"
      :class="{ active: model === key }"
      @click="model = key"
    >
      {{ key }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.toggle {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: #eef0f3;
  border-radius: 999px;
  padding: 3px;
}

button {
  border: 0;
  background: transparent;
  height: 30px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  color: $text-2;
  transition: background 0.15s, color 0.15s;

  &.active {
    background: $navy;
    color: #fff;
  }
}
</style>
