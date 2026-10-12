<script setup lang="ts">
import { Clock } from 'lucide-vue-next';
import type { PilotProfile } from '~/types/api';

defineProps<{ profile: PilotProfile | null; loading: boolean }>();
const avatarFailed = ref(false);
const initials = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
</script>

<template>
  <header class="header">
    <div class="top">
      <UiAppLogo :height="24" inverted />
    </div>

    <div class="pilot">
      <div class="who">
        <p class="greeting">Welcome back,</p>
        <h1 v-if="profile" class="name">{{ profile.name }}</h1>
        <div v-else class="name skeleton dark" style="width: 160px; height: 24px" />
      </div>
      <div class="avatar" aria-hidden="true">
        <img v-if="profile && !avatarFailed" :src="profile.avatarUrl" alt="" @error="avatarFailed = true" />
        <span v-else-if="profile">{{ initials(profile.name) }}</span>
      </div>
    </div>

    <div class="total">
      <Clock :size="18" />
      <span class="label">Total flight hours</span>
      <span v-if="profile" class="value">{{ profile.totalFlightHours.toLocaleString('en-US', { minimumFractionDigits: 1 }) }}<small>h</small></span>
      <span v-else class="skeleton dark" style="width: 64px; height: 20px" />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  background: $navy;
  color: #fff;
  padding: 16px $gutter 20px;
  border-radius: 0 0 24px 24px;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pilot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  gap: 12px;
}

.greeting {
  font-size: 13px;
  color: rgba(#fff, 0.7);
}

.name {
  font-size: 22px;
  font-weight: 800;
  margin-top: 2px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid rgba(#fff, 0.85);
  overflow: hidden;
  flex-shrink: 0;
  background: $navy-2;
  display: grid;
  place-items: center;
  font-weight: 700;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.total {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: $navy-2;
  border-radius: $radius-sm;
  padding: 12px 14px;
  color: $accent;

  .label {
    flex: 1;
    color: rgba(#fff, 0.8);
    font-size: 13px;
  }
  .value {
    @include num;
    color: #fff;
    font-size: 20px;
    small {
      font-size: 13px;
      font-weight: 600;
      margin-left: 2px;
      color: rgba(#fff, 0.7);
    }
  }
}

.skeleton.dark {
  background: linear-gradient(90deg, $navy-2 25%, #24406a 50%, $navy-2 75%);
  background-size: 200% 100%;
}
</style>
