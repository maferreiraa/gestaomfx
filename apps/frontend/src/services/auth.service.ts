import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name?: string
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials)
    return response.data.data
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/refresh', {
      refreshToken,
    })
    return response.data.data
  },

  async getMe(token: string) {
    const response = await api.get<{ success: boolean; data: any }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data.data
  },
}

export default authService
