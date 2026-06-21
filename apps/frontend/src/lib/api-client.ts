import axios, { type InternalAxiosRequestConfig } from 'axios'

let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// On 401: refresh once and replay; concurrent 401s queue behind the same refresh call
let isRefreshing = false
let queue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: InternalAxiosRequestConfig & { _retry?: boolean } = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token')

      // Use bare axios (not the instance) to avoid interceptor loop
      const { data } = await axios.post<{ accessToken: string }>(
        '/api/v1/auth/refresh',
        { refreshToken }
      )

      setAccessToken(data.accessToken)
      // Backend does not rotate refresh tokens — existing token in localStorage remains valid

      const newToken = data.accessToken
      queue.forEach((p) => p.resolve(newToken))
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (err) {
      queue.forEach((p) => p.reject(err))
      setAccessToken(null)
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(err)
    } finally {
      queue = []
      isRefreshing = false
    }
  }
)

export default api
