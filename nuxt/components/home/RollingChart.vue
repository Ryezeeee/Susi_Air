<script setup lang="ts">
import type { FlightHoursSummary } from '~/types/api';

/**
 * Rolling-sum trend chart, hand-built in SVG so the limit line, today marker,
 * projected segment and over-limit points are fully under our control.
 * It renders whatever the API returns; no maths beyond scaling to pixels.
 */
const props = defineProps<{ data: FlightHoursSummary }>();

const W = 340;
const H = 220;
const PAD = { top: 16, right: 12, bottom: 34, left: 36 };
const innerW = W - PAD.left - PAD.right;
const innerH = H - PAD.top - PAD.bottom;

const points = computed(() => props.data.series);
const todayIndex = computed(() => Math.max(points.value.findIndex((p) => p.isToday), 0));
const selected = ref<number | null>(null);
watch(() => props.data, () => (selected.value = null));
const active = computed(() => points.value[selected.value ?? todayIndex.value]);

/**
 * Y max comes from the API per range. If a value overshoots it, extend the axis
 * so nothing is clipped (brief: render over-limit values without breaking layout).
 */
const yTop = computed(() => {
  const maxVal = Math.max(...points.value.map((p) => p.value), props.data.limit);
  return maxVal > props.data.yMax ? niceCeil(maxVal * 1.05) : props.data.yMax;
});

function niceCeil(v: number) {
  const mag = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / (mag / 2)) * (mag / 2);
}

const ticks = computed(() => {
  const raw = yTop.value / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = 0; v <= yTop.value + 1e-9; v += step) out.push(Math.round(v * 10) / 10);
  return out;
});

const x = (i: number) => PAD.left + (innerW * i) / Math.max(points.value.length - 1, 1);
const y = (v: number) => PAD.top + innerH - (innerH * Math.max(v, 0)) / yTop.value;

const path = (from: number, to: number) =>
  points.value
    .slice(from, to + 1)
    .map((p, k) => `${k === 0 ? 'M' : 'L'}${x(from + k).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(' ');

const flownPath = computed(() => path(0, todayIndex.value));
const projectedPath = computed(() => path(todayIndex.value, points.value.length - 1));
const areaPath = computed(
  () =>
    `${path(0, points.value.length - 1)} L${x(points.value.length - 1)},${y(0)} L${x(0)},${y(0)} Z`,
);
const limitY = computed(() => y(props.data.limit));

const colW = computed(() => innerW / Math.max(points.value.length - 1, 1));

const dayNum = (iso: string) => Number(iso.slice(8, 10));

const activeNote = computed(() => {
  const p = active.value;
  if (!p) return '';
  const diff = Math.round((p.value - props.data.limit) * 10) / 10;
  if (diff > 0) return `${formatHours(diff)}h over limit`;
  return `${formatHours(Math.abs(diff))}h below limit`;
});

function select(i: number) {
  selected.value = i;
}
</script>

<template>
  <div class="chart">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      role="img"
      :aria-label="`Rolling ${data.windowDays}-day flight hours, limit ${data.limit} hours, seven days either side of today`"
    >
      <defs>
        <linearGradient id="fh-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#22C5E8" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#22C5E8" stop-opacity="0" />
        </linearGradient>
        <clipPath id="fh-plot">
          <rect :x="PAD.left" :y="PAD.top" :width="innerW" :height="innerH" />
        </clipPath>
      </defs>

      <!-- over-limit zone -->
      <rect
        :x="PAD.left"
        :y="PAD.top"
        :width="innerW"
        :height="Math.max(limitY - PAD.top, 0)"
        class="over-zone"
      />

      <!-- grid + y labels -->
      <g v-for="t in ticks" :key="t">
        <line :x1="PAD.left" :x2="W - PAD.right" :y1="y(t)" :y2="y(t)" class="grid" />
        <text v-if="Math.abs(y(t) - limitY) > 11" :x="PAD.left - 6" :y="y(t) + 3.5" class="y-label">{{ t }}</text>
      </g>

      <!-- today marker -->
      <line :x1="x(todayIndex)" :x2="x(todayIndex)" :y1="PAD.top" :y2="y(0)" class="today-line" />

      <!-- area + lines -->
      <path :d="areaPath" fill="url(#fh-area)" clip-path="url(#fh-plot)" />
      <path :d="flownPath" class="line" />
      <path :d="projectedPath" class="line projected" />

      <!-- limit line -->
      <line :x1="PAD.left" :x2="W - PAD.right" :y1="limitY" :y2="limitY" class="limit-line" />
      <text :x="PAD.left - 6" :y="limitY + 3.5" class="limit-label">{{ data.limit }}</text>

      <!-- points -->
      <circle
        v-for="(p, i) in points"
        :key="p.date"
        :cx="x(i)"
        :cy="y(p.value)"
        :r="i === (selected ?? todayIndex) ? 5 : 3"
        class="pt"
        :class="{ over: p.overLimit, projected: p.isProjected, active: i === (selected ?? todayIndex) }"
      />

      <!-- x labels -->
      <g v-for="(p, i) in points" :key="`x-${p.date}`">
        <rect v-if="p.isToday" :x="x(i) - 13" :y="H - PAD.bottom + 8" width="26" height="17" rx="8.5" class="today-pill" />
        <text :x="x(i)" :y="H - PAD.bottom + 20" class="x-label" :class="{ today: p.isToday }">{{ dayNum(p.date) }}</text>
      </g>

      <!-- hit areas (tap a day to inspect it) -->
      <rect
        v-for="(p, i) in points"
        :key="`hit-${p.date}`"
        :x="x(i) - colW / 2"
        :y="PAD.top"
        :width="colW"
        :height="H - PAD.top"
        class="hit"
        tabindex="0"
        role="button"
        :aria-label="`${formatDayLabel(p.date)}: ${p.value} hours`"
        @click="select(i)"
        @keydown.enter.prevent="select(i)"
        @keydown.space.prevent="select(i)"
      />
    </svg>

    <div v-if="active" class="readout" :class="{ over: active.overLimit }" aria-live="polite">
      <div>
        <p class="date">
          {{ active.isToday ? 'Today' : formatDayLabel(active.date) }}
          <span v-if="active.isProjected" class="tag">Projected</span>
          <span v-if="active.isPartialWindow" class="tag muted">Partial data</span>
        </p>
        <p class="sub">Last {{ data.windowDays }} days · {{ formatHours(active.dayHours) }}h that day</p>
      </div>
      <div class="value">
        <strong>{{ formatHours(active.value) }}h</strong>
        <span>{{ activeNote }}</span>
      </div>
    </div>

    <ul class="legend">
      <li><i class="sw flown" />Flown</li>
      <li><i class="sw proj" />Planned</li>
      <li><i class="sw limit" />Limit</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

.grid {
  stroke: #eef0f3;
  stroke-width: 1;
}

.y-label {
  font-size: 10px;
  fill: $text-2;
  text-anchor: end;
  font-variant-numeric: tabular-nums;
}

.x-label {
  font-size: 10px;
  fill: $text-2;
  text-anchor: middle;
  font-variant-numeric: tabular-nums;
  &.today {
    fill: #fff;
    font-weight: 700;
  }
}

.today-pill {
  fill: $navy;
}

.today-line {
  stroke: $navy;
  stroke-opacity: 0.25;
  stroke-dasharray: 3 3;
}

.over-zone {
  fill: $danger;
  fill-opacity: 0.05;
}

.line {
  fill: none;
  stroke: $accent;
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
  &.projected {
    stroke-dasharray: 5 5;
    stroke-opacity: 0.85;
  }
}

.limit-line {
  stroke: $danger;
  stroke-width: 1.5;
}

.limit-label {
  font-size: 10.5px;
  font-weight: 800;
  fill: $danger;
  text-anchor: end;
  font-variant-numeric: tabular-nums;
}

.pt {
  fill: #fff;
  stroke: $accent;
  stroke-width: 2;
  transition: r 0.15s;
  &.projected {
    fill: #fff;
  }
  &.over {
    stroke: $danger;
    fill: $danger;
  }
  &.active {
    stroke-width: 2.5;
  }
}

.hit {
  fill: transparent;
  cursor: pointer;
  outline: none;
  &:focus-visible {
    fill: rgba($accent, 0.08);
  }
}

.readout {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: $radius-sm;
  background: $bg;

  .date {
    font-size: 13px;
    font-weight: 700;
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
  }
  .sub {
    font-size: 11.5px;
    color: $text-2;
    margin-top: 2px;
  }
  .tag {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 999px;
    background: rgba($accent, 0.15);
    color: #0a7f98;
    &.muted {
      background: #e5e7eb;
      color: $text-2;
    }
  }
  .value {
    text-align: right;
    strong {
      @include num;
      font-size: 18px;
      display: block;
    }
    span {
      font-size: 11px;
      color: $success;
      font-weight: 600;
    }
  }
  &.over .value {
    strong,
    span {
      color: $danger;
    }
  }
}

.legend {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: $text-2;

  li {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sw {
    width: 16px;
    height: 0;
    border-top: 2.5px solid $accent;
    &.proj {
      border-top-style: dashed;
    }
    &.limit {
      border-top: 1.5px solid $danger;
    }
  }
}
</style>
