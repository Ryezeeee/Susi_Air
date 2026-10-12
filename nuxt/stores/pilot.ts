import { defineStore } from 'pinia';
import type { PilotProfile } from '~/types/api';

export const usePilotStore = defineStore('pilot', {
  state: () => ({
    profile: null as PilotProfile | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchProfile(force = false) {
      if (this.profile && !force) return;
      this.loading = true;
      this.error = null;
      try {
        this.profile = await useApi()<PilotProfile>('/pilot/me');
      } catch (e) {
        this.error = apiErrorMessage(e, 'Could not load your profile.');
      } finally {
        this.loading = false;
      }
    },
  },
});
