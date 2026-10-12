import { defineStore } from 'pinia';
import type { LoginResponse } from '~/types/api';

export const useAuthStore = defineStore('auth', () => {
  // Cookie so a refresh keeps the session; SameSite=Strict, expires with the token (12h).
  const tokenCookie = useCookie<string | null>('susi_token', {
    maxAge: 60 * 60 * 12,
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    default: () => null,
  });

  const token = computed(() => tokenCookie.value);
  const isAuthenticated = computed(() => !!tokenCookie.value);

  async function login(username: string, password: string) {
    const { public: cfg } = useRuntimeConfig();
    const res = await $fetch<LoginResponse>('/auth/login', {
      baseURL: cfg.apiBase,
      method: 'POST',
      body: { username: username.trim(), password },
    });
    tokenCookie.value = res.accessToken;
  }

  function logout() {
    tokenCookie.value = null;
    // Drop cached pilot data so the next user starts clean.
    usePilotStore().$reset();
    useFlightHoursStore().$reset();
    useDocumentsStore().$reset();
    useScheduleStore().$reset();
  }

  return { token, isAuthenticated, login, logout };
});
