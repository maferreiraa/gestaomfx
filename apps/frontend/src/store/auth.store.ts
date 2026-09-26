import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService, { LoginCredentials, AuthResponse } from '@/services/auth.service'

export interface User {
  id: string
  email: string
  name?: string
}

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null

  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  setError: (error: string | null) => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const response: AuthResponse = await authService.login(credentials)
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          })
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || 'Erro ao fazer login'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
        })
      },

      setUser: (user: User | null) => set({ user }),
      setAccessToken: (token: string | null) => set({ accessToken: token }),
      setError: (error: string | null) => set({ error }),

      isAuthenticated: () => {
        const { accessToken } = get()
        return !!accessToken
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
