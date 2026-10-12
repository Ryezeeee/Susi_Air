import { defineStore } from 'pinia';
import type { DocumentsResponse, PilotDocument } from '~/types/api';

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [] as PilotDocument[],
    loaded: false,
    loading: false,
    error: null as string | null,
  }),
  getters: {
    attentionCount: (s) => s.documents.filter((d) => d.status !== 'safe').length,
  },
  actions: {
    async fetchDocuments(force = false) {
      if (this.loaded && !force) return;
      this.loading = true;
      this.error = null;
      try {
        const res = await useApi()<DocumentsResponse>('/documents');
        this.documents = res.documents;
        this.loaded = true;
      } catch (e) {
        this.error = apiErrorMessage(e, 'Could not load your documents.');
      } finally {
        this.loading = false;
      }
    },
  },
});
