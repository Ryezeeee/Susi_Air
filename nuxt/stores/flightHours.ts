import { defineStore } from 'pinia';
import type { FlightHoursSummary, LimitCard, RangeKey } from '~/types/api';

/**
 * Holds the /flight-hours/summary responses. Each range is fetched once and
 * cached, so flipping the toggle back and forth is instant. All maths happens
 * on the server; this store only stores what comes back.
 */
export const useFlightHoursStore = defineStore('flightHours', {
  state: () => ({
    range: '1w' as RangeKey,
    byRange: {} as Partial<Record<RangeKey, FlightHoursSummary>>,
    loading: false,
    error: null as string | null,
  }),
  getters: {
    current: (s): FlightHoursSummary | undefined => s.byRange[s.range],
    // Cards don't depend on the range, so any cached response has them.
    cards: (s): LimitCard[] => Object.values(s.byRange)[0]?.cards ?? [],
  },
  actions: {
    async setRange(range: RangeKey) {
      this.range = range;
      await this.fetchSummary(range);
    },
    async fetchSummary(rangeArg?: RangeKey, force = false) {
      const range = rangeArg ?? this.range;
      if (this.byRange[range] && !force) return;
      this.loading = true;
      this.error = null;
      try {
        const data = await useApi()<FlightHoursSummary>('/flight-hours/summary', { query: { range } });
        this.byRange[range] = data;
      } catch (e) {
        this.error = apiErrorMessage(e, 'Could not load flight hours.');
      } finally {
        this.loading = false;
      }
    },
  },
});
