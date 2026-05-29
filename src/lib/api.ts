import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Inyecta el token en cada request si existe
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el token expiró (401) intenta renovarlo automáticamente
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) throw new Error('No refresh token')
        const { data } = await axios.post(`${API_URL}/api/auth/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        // Refresh también falló — forzar logout
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Endpoints ────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: object) => api.post('/api/auth/register/', data),
  login: (data: object) => api.post('/api/auth/login/', data),
  logout: (refresh: string) => api.post('/api/auth/logout/', { refresh }),
  me: () => api.get('/api/auth/me/'),
  updateMe: (data: object) => api.patch('/api/auth/me/', data),
}

export const storesApi = {
  plans: () => api.get('/api/stores/plans/'),
  create: (data: object) => api.post('/api/stores/', data),
  me: () => api.get('/api/stores/me/'),
  update: (data: object) => api.patch('/api/stores/me/', data),
  planStatus: () => api.get('/api/stores/me/plan/'),
  public: (slug: string) => api.get(`/api/stores/${slug}/`),
}

export const catalogApi = {
  // Público
  products: (storeSlug?: string, params?: object) =>
    api.get(storeSlug ? `/api/catalog/${storeSlug}/products/` : '/api/catalog/products/', { params }),

  // Dashboard
  myProducts: (params?: object) => api.get('/api/catalog/my-products/', { params }),
  createProduct: (data: object) => api.post('/api/catalog/my-products/', data),
  updateProduct: (id: number, data: object) => api.patch(`/api/catalog/my-products/${id}/`, data),
  deleteProduct: (id: number) => api.delete(`/api/catalog/my-products/${id}/`),

  // Categorías
  categories: () => api.get('/api/catalog/categories/'),
  createCategory: (data: object) => api.post('/api/catalog/categories/', data),

  // IA
  aiDescription: (data: { name: string; category?: string; price?: string; keywords?: string; tone?: string }) =>
    api.post('/api/catalog/ai/description/', data),
  aiSocialPost: (data: { name: string; price?: string; platform?: string }) =>
    api.post('/api/catalog/ai/social-post/', data),
}

export const salesApi = {
  checkout: (data: object) => api.post('/api/sales/checkout/', data),
  mySales: (params?: object) => api.get('/api/sales/my-sales/', { params }),
  saleDetail: (orderRef: string) => api.get(`/api/sales/${orderRef}/`),
  analytics: (period?: number) => api.get('/api/sales/analytics/', { params: period ? { period } : {} }),
}
