// stores/auth.ts
import { defineStore } from 'pinia'
import { apiPost } from '@/api/client'
import { getErrorMessage } from '@/utils/errorHandler'

function decodeToken(token: string | null) {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    username: null as string | null,
    userId: null as string | null,
    error: null as string | null,
    loading: false,
  }),

  actions: {
    async login(username: string, password: string) {
      this.loading = true
      this.error = null

      try {
        const res = await apiPost<
          { username: string; password: string },
          { failed?: false; token: string }
        >('/auth/login', { username, password })

        this.token = res.token
        this.username = username
        const decoded = decodeToken(res.token)
        this.userId = decoded?.user_id || decoded?.sub || null

        localStorage.setItem(
          'auth',
          JSON.stringify({
            token: this.token,
            username: this.username,
            userId: this.userId,
          }),
        )
      } catch (err) {
        this.error = getErrorMessage(err)
      }

      this.loading = false
    },

    logout() {
      this.token = null
      this.username = null
      this.userId = null
      localStorage.removeItem('auth')
    },

    restore() {
      const saved = localStorage.getItem('auth')
      if (!saved) return

      try {
        const parsed = JSON.parse(saved)
        this.token = parsed.token ?? null
        this.username = parsed.username ?? null
        this.userId = parsed.user_id ?? null

        if (this.token && !this.userId) {
          const decoded = decodeToken(this.token)
          this.userId = decoded?.user_id || decoded?.sub || null
        }
      } catch {
        this.logout()
      }
    },
  },
})
