<script setup lang="ts">
import { ArrowLeft, Construction } from 'lucide-vue-next';
defineProps<{ title: string; subtitle?: string; back?: string }>();
</script>

<template>
  <div class="coming-soon">
    <header class="top">
      <NuxtLink v-if="back" :to="back" class="back" aria-label="Back"><ArrowLeft :size="20" /></NuxtLink>
      <h1>{{ title }}</h1>
    </header>
    <div class="body">
      <div class="icon"><Construction :size="28" /></div>
      <h2>{{ subtitle ?? 'Coming soon' }}</h2>
      <p><slot>This screen is not part of the current release.</slot></p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px $gutter;
  background: $surface;
  border-bottom: 1px solid $border;

  h1 {
    font-size: 17px;
    font-weight: 700;
  }
}

.back {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-left: -8px;
  &:hover {
    background: $bg;
  }
}

.body {
  text-align: center;
  padding: 72px 32px;

  .icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba($accent, 0.12);
    color: $navy;
    display: grid;
    place-items: center;
    margin: 0 auto 16px;
  }

  h2 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  p {
    color: $text-2;
    font-size: 14px;
  }
}
</style>
