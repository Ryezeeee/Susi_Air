import type { FetchError } from 'ofetch';
import type { ApiErrorBody } from '~/types/api';

/**
 * Thin $fetch wrapper: base URL from runtime config, bearer token on every
 * request, and an automatic sign-out when the API says the token is no good.
 */
export function useApi() {
  const { public: cfg } = useRuntimeConfig();
  const auth = useAuthStore();

  return $fetch.create({
    baseURL: cfg.apiBase,
    onRequest({ options }) {
      if (auth.token) {
        const headers = new Headers(options.headers as HeadersInit | undefined);
        headers.set('Authorization', `Bearer ${auth.token}`);
        options.headers = headers;
      }
    },
    onResponseError({ request, response }) {
      const isLogin = String(request).includes('/auth/login');
      if (response.status === 401 && !isLogin && auth.token) {
        auth.logout();
        navigateTo({ path: '/login', query: { expired: '1' } });
      }
    },
  });
}

/** Turn any fetch failure into one human-readable line. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const e = err as FetchError<ApiErrorBody>;
  if (e?.data?.message) return e.data.message;
  if (e?.name === 'FetchError' && !e.response) return 'Cannot reach the server. Check your connection.';
  return fallback;
}

export function apiErrorCode(err: unknown): string | undefined {
  return (err as FetchError<ApiErrorBody>)?.data?.error;
}
