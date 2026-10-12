export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  if (to.path === '/login') {
    if (auth.isAuthenticated) return navigateTo('/');
    return;
  }
  if (!auth.isAuthenticated) {
    return navigateTo({ path: '/login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : {} });
  }
});
