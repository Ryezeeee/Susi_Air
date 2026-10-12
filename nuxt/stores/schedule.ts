import { defineStore } from 'pinia';
import type { LegendItem, ScheduleDay, SchedulesResponse } from '~/types/api';

function initialMonth() {
  // Opening month comes from config (APP_TODAY), never from the device clock.
  const { public: cfg } = useRuntimeConfig();
  const [y, m] = String(cfg.appToday).split('-').map(Number);
  return { year: y, month: m };
}

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    ...initialMonth(),
    today: '' as string,
    entries: [] as ScheduleDay[],
    legend: [] as LegendItem[],
    loading: false,
    error: null as string | null,
    requestId: 0,
  }),
  getters: {
    byDate: (s): Record<string, ScheduleDay> =>
      Object.fromEntries(s.entries.map((e) => [e.dutyDate, e])),
  },
  actions: {
    /** Every month change calls /schedules?year=&month= (no client-side cache, per the brief). */
    async fetchMonth() {
      const id = ++this.requestId; // ignore stale responses if the user taps quickly
      this.loading = true;
      this.error = null;
      try {
        const res = await useApi()<SchedulesResponse>('/schedules', {
          query: { year: this.year, month: this.month },
        });
        if (id !== this.requestId) return;
        this.entries = res.entries;
        this.legend = res.legend;
        this.today = res.today;
      } catch (e) {
        if (id !== this.requestId) return;
        this.entries = [];
        this.error = apiErrorMessage(e, 'Could not load the schedule.');
      } finally {
        if (id === this.requestId) this.loading = false;
      }
    },
    shiftMonth(delta: number) {
      const total = this.year * 12 + (this.month - 1) + delta;
      this.year = Math.floor(total / 12);
      this.month = (total % 12) + 1;
      return this.fetchMonth();
    },
  },
});
