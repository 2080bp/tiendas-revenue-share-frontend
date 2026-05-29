'use client'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, setAuth, logout: clearAuth } = useAuthStore()

  async function login(username: string, password: string) {
    const { data } = await authApi.login({ username, password })
    const me = await authApi.me()
    // Acceder después de setear tokens
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setAuth(me.data, data.access, data.refresh)
    return me.data
  }

  async function register(payload: object) {
    await authApi.register(payload)
  }

  async function logout() {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) await authApi.logout(refresh)
    } catch {}
    clearAuth()
    router.push('/login')
  }

  return { user, isAuthenticated, login, register, logout }
}
