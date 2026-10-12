<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import type { ScheduleDay } from '~/types/api';

const props = defineProps<{
  year: number;
  month: number; // 1-12
  today: string;
  byDate: Record<string, ScheduleDay>;
}>();
const emit = defineEmits<{ select: [date: string] }>();

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Cell {
  date: string;
  day: number;
  entry?: ScheduleDay;
}

/** Month grid, weeks starting Monday; leading blanks are `null`. */
const cells = computed<(Cell | null)[]>(() => {
  const { year, month } = props;
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const out: (Cell | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    out.push({ date, day: d, entry: props.byDate[date] });
  }
  return out;
});

function cellLabel(c: Cell): string {
  const base = formatDayLabel(c.date);
  if (!c.entry) return `${base}, no duty`;
  const status = c.entry.isComplete ? 'all duties logged' : `${c.entry.remaining} remaining`;
  return `${base}, ${c.entry.dutyType} ${c.entry.baseName}, ${status}`;
}
</script>

<template>
  <div class="calendar">
    <div class="weekdays" aria-hidden="true">
      <span v-for="w in WEEKDAYS" :key="w">{{ w }}</span>
    </div>
    <div class="grid" role="grid">
      <template v-for="(c, i) in cells" :key="c?.date ?? `blank-${i}`">
        <span v-if="!c" class="cell blank" />
        <button
          v-else
          type="button"
          class="cell"
          :class="{ filled: !!c.entry, today: c.date === today }"
          :style="c.entry ? { background: c.entry.baseColor, color: readableTextOn(c.entry.baseColor) } : undefined"
          :aria-label="cellLabel(c)"
          @click="emit('select', c.date)"
        >
          <span class="num">{{ c.day }}</span>
          <template v-if="c.entry">
            <span class="badge" :class="{ done: c.entry.isComplete }">
              <Check v-if="c.entry.isComplete" :size="10" :stroke-width="3.5" />
              <template v-else>{{ c.entry.remaining }}</template>
            </span>
            <span class="code">{{ c.entry.baseName }}</span>
          </template>
        </button>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;

  span {
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: $text-2;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.cell {
  position: relative;
  aspect-ratio: 1 / 1.12;
  border: 0;
  border-radius: 10px;
  background: #f3f4f6;
  color: $text;
  padding: 5px 4px 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  transition: transform 0.1s;
  min-width: 0;

  &:active {
    transform: scale(0.96);
  }

  &.blank {
    background: transparent;
  }

  &.today {
    box-shadow: 0 0 0 2px $surface, 0 0 0 4px $red;
  }
}

.num {
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.code {
  align-self: center;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  position: absolute;
  top: 3px;
  right: 3px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #fff;
  color: $navy;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);

  &.done {
    background: $navy;
    color: #fff;
    padding: 0;
  }
}
</style>
