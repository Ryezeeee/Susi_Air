<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import type { LegendItem } from '~/types/api';

defineProps<{ items: LegendItem[] }>();
</script>

<template>
  <div class="legend">
    <ul class="types">
      <li v-for="item in items" :key="item.code">
        <span class="swatch" :style="{ background: item.color }" />
        <span class="code">{{ item.code }}</span>
        <span class="label">{{ item.label }}</span>
      </li>
    </ul>
    <div class="badges">
      <span><i class="b done"><Check :size="10" :stroke-width="3.5" /></i>All duties logged</span>
      <span><i class="b">2</i>Duties still to log</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.legend {
  @include card;
  padding: 14px;
}

.types {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 12px;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    min-width: 0;
  }
}

.swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.code {
  font-weight: 800;
  width: 30px;
  flex-shrink: 0;
}

.label {
  color: $text-2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f0f1f4;
  font-size: 12px;
  color: $text-2;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.b {
  font-style: normal;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 800;
  background: #fff;
  color: $navy;
  box-shadow: 0 0 0 1px $border;

  &.done {
    background: $navy;
    color: #fff;
    box-shadow: none;
  }
}
</style>
