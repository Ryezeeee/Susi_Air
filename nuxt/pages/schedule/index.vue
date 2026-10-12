<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

useHead({ title: 'Schedule · Susi Air Pilot' });

const schedule = useScheduleStore();

const summary = computed(() => {
  const e = schedule.entries;
  return {
    duties: e.length,
    pending: e.reduce((n, d) => n + d.remaining, 0),
  };
});

onMounted(() => schedule.fetchMonth());

function openDay(date: string) {
  navigateTo(`/schedule/${date}`);
}
</script>

<template>
  <div>
    <header class="page-head">
      <h1>Schedule</h1>
      <div class="month-nav">
        <button type="button" aria-label="Previous month" @click="schedule.shiftMonth(-1)">
          <ChevronLeft :size="20" />
        </button>
        <h2 aria-live="polite">{{ monthName(schedule.month) }} {{ schedule.year }}</h2>
        <button type="button" aria-label="Next month" @click="schedule.shiftMonth(1)">
          <ChevronRight :size="20" />
        </button>
      </div>
    </header>

    <section class="section">
      <div class="stats" :class="{ dim: schedule.loading }">
        <div><strong>{{ summary.duties }}</strong><span>Scheduled days</span></div>
        <div><strong>{{ summary.pending }}</strong><span>Duties to log</span></div>
      </div>

      <div class="cal-card" :class="{ loading: schedule.loading }" :aria-busy="schedule.loading">
        <UiErrorState v-if="schedule.error" :message="schedule.error" @retry="schedule.fetchMonth()" />
        <ScheduleCalendarMonth
          v-else
          :year="schedule.year"
          :month="schedule.month"
          :today="schedule.today"
          :by-date="schedule.byDate"
          @select="openDay"
        />
        <p v-if="!schedule.loading && !schedule.error && !schedule.entries.length" class="empty">
          No duties scheduled this month.
        </p>
      </div>
    </section>

    <section v-if="schedule.legend.length" class="section">
      <h2 class="section-title">Legend</h2>
      <ScheduleLegend :items="schedule.legend" />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.page-head {
  background: $navy;
  color: #fff;
  padding: 18px $gutter 16px;
  border-radius: 0 0 24px 24px;

  h1 {
    font-size: 20px;
    font-weight: 800;
  }
}

.month-nav {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $navy-2;
  border-radius: 999px;
  padding: 4px;

  h2 {
    font-size: 15px;
    font-weight: 700;
  }

  button {
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #fff;
    display: grid;
    place-items: center;
    &:hover {
      background: rgba(#fff, 0.1);
    }
  }
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
  transition: opacity 0.15s;

  &.dim {
    opacity: 0.5;
  }

  div {
    @include card;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
  }
  strong {
    @include num;
    font-size: 22px;
  }
  span {
    font-size: 12px;
    color: $text-2;
  }
}

.cal-card {
  @include card;
  padding: 14px 10px;
  transition: opacity 0.15s;

  &.loading {
    opacity: 0.55;
    pointer-events: none;
  }
}

.empty {
  text-align: center;
  font-size: 13px;
  color: $text-2;
  margin-top: 12px;
}
</style>
