export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth()
  auth.load()
  if (to.path === '/login') return auth.isLoggedIn.value ? navigateTo('/') : undefined
  if (!auth.isLoggedIn.value) return navigateTo('/login')
})
