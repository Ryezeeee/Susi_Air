<script setup lang="ts">
/**
 * Susi Air logo from /public/susi-air-logo.png (asset taken from susiair.com).
 * If the file is missing, falls back to the plain company name so the layout holds.
 */
withDefaults(defineProps<{ height?: number; inverted?: boolean }>(), { height: 28, inverted: false });
const failed = ref(false);
// Bound as a runtime string so the build doesn't require the file to exist.
const logoSrc = '/susi-air-logo.png';
</script>

<template>
  <img
    v-if="!failed"
    :src="logoSrc"
    alt="Susi Air"
    class="logo"
    :class="{ inverted }"
    :style="{ height: `${height}px` }"
    @error="failed = true"
  />
  <span v-else class="logo-text" :class="{ inverted }" :style="{ fontSize: `${height * 0.6}px` }">SUSI AIR</span>
</template>

<style lang="scss" scoped>
.logo {
  display: block;
  width: auto;
  &.inverted {
    // Logo sits on a white pill so the original colours stay intact on navy.
    background: #fff;
    border-radius: 8px;
    padding: 4px 8px;
    box-sizing: content-box;
  }
}

.logo-text {
  font-weight: 800;
  letter-spacing: 0.08em;
  color: $navy;
  &.inverted {
    color: #fff;
  }
}
</style>
