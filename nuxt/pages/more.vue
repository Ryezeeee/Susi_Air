<script setup lang="ts">
import { ChevronRight, LogOut } from 'lucide-vue-next';

useHead({ title: 'More · Susi Air Pilot' });
const auth = useAuthStore();
const pilot = usePilotStore();
onMounted(() => pilot.fetchProfile());

function signOut() {
  auth.logout();
  navigateTo('/login', { replace: true });
}
</script>

<template>
  <div>
    <header class="top"><h1>More</h1></header>
    <section class="section">
      <div v-if="pilot.profile" class="profile">
        <img :src="pilot.profile.avatarUrl" alt="" />
        <div>
          <p class="name">{{ pilot.profile.name }}</p>
          <p class="sub">Pilot · Susi Air</p>
        </div>
      </div>
      <button type="button" class="row danger" @click="signOut">
        <LogOut :size="18" /> <span>Sign out</span> <ChevronRight :size="18" class="chev" />
      </button>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.top {
  padding: 16px $gutter;
  background: $surface;
  border-bottom: 1px solid $border;
  h1 {
    font-size: 17px;
    font-weight: 700;
  }
}

.profile {
  @include card;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  margin-bottom: 12px;

  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
  .name {
    font-weight: 700;
  }
  .sub {
    font-size: 12px;
    color: $text-2;
  }
}

.row {
  @include card;
  width: 100%;
  border: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  font-weight: 600;
  text-align: left;

  span {
    flex: 1;
  }
  &.danger {
    color: $danger;
  }
  .chev {
    color: $text-2;
  }
}
</style>
