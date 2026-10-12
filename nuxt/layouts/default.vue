<template>
  <div class="app-shell">
    <main class="app-main">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  max-width: $app-max;
  min-height: 100dvh;
  margin: 0 auto;
  background: $bg;
  position: relative;
  // On desktop, show the app as a phone-width column.
  @media (min-width: $app-max + 1) {
    box-shadow: 0 0 0 1px $border;
  }
}

.app-main {
  padding-bottom: calc(#{$nav-h} + 24px + env(safe-area-inset-bottom));
}
</style>
