<script setup lang="ts">
import { BookOpen, CalendarDays, Home, Menu } from 'lucide-vue-next';

const route = useRoute();
const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/logbook', label: 'Logbook', icon: BookOpen },
  { to: '/more', label: 'More', icon: Menu },
];

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to));
</script>

<template>
  <nav class="bottom-nav" aria-label="Main">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="nav-item"
      :class="{ active: isActive(item.to) }"
      :aria-current="isActive(item.to) ? 'page' : undefined"
    >
      <component :is="item.icon" :size="22" :stroke-width="isActive(item.to) ? 2.4 : 1.8" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style lang="scss" scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: $app-max;
  height: calc(#{$nav-h} + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: $surface;
  border-top: 1px solid $border;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  z-index: 20;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 500;
  color: $text-2;
  position: relative;

  &.active {
    color: $navy;
    font-weight: 700;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      width: 28px;
      height: 3px;
      border-radius: 0 0 3px 3px;
      background: $red;
    }
  }
}
</style>
