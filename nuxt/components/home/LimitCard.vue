<script setup lang="ts">
import type { LimitCard } from '~/types/api';

const props = defineProps<{ card: LimitCard }>();

const windowText = computed(() =>
  props.card.windowDays === 1 ? 'Today' : `Rolling ${props.card.windowDays} days`,
);
const statusText = computed(() => {
  const c = props.card;
  if (c.status === 'over') return `${formatHours(Math.round((c.hours - c.limit) * 10) / 10)}h over`;
  return `${formatHours(c.remaining)}h left`;
});
const fill = computed(() => `${Math.min(props.card.percent, 100)}%`);
</script>

<template>
  <article class="limit-card" :class="card.status">
    <header>
      <h3>{{ card.label }}</h3>
      <span class="window">{{ windowText }}</span>
    </header>
    <p class="figure">
      <span class="hours">{{ formatHours(card.hours) }}</span>
      <span class="limit">/ {{ card.limit }}h</span>
    </p>
    <div
      class="bar"
      role="progressbar"
      :aria-valuenow="card.hours"
      :aria-valuemin="0"
      :aria-valuemax="card.limit"
      :aria-label="`${card.label}: ${card.hours} of ${card.limit} hours`"
    >
      <span :style="{ width: fill }" />
    </div>
    <footer>
      <span class="dot" />
      <span>{{ statusText }}</span>
      <span class="pct">{{ Math.round(card.percent) }}%</span>
    </footer>
  </article>
</template>

<style lang="scss" scoped>
.limit-card {
  @include card;
  padding: 14px;
  --tone: #{$success};

  &.warning {
    --tone: #{$warning};
  }
  &.over {
    --tone: #{$danger};
  }
}

header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;

  h3 {
    font-size: 13px;
    font-weight: 700;
  }
  .window {
    font-size: 10.5px;
    color: $text-2;
    white-space: nowrap;
  }
}

.figure {
  margin-top: 10px;
  display: flex;
  align-items: baseline;
  gap: 4px;

  .hours {
    @include num;
    font-size: 24px;
    line-height: 1;
  }
  .limit {
    font-size: 13px;
    color: $text-2;
    font-weight: 600;
  }
}

.bar {
  margin-top: 10px;
  height: 6px;
  border-radius: 999px;
  background: #eef0f3;
  overflow: hidden;

  span {
    display: block;
    height: 100%;
    background: var(--tone);
    border-radius: inherit;
    transition: width 0.4s ease;
  }
}

footer {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: $text-2;

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--tone);
  }
  .pct {
    margin-left: auto;
    @include num;
    color: var(--tone);
  }
}
</style>
