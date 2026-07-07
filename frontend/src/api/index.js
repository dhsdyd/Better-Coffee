import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 20000
})

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.error || err.message || '网络错误'
    return Promise.reject(new Error(msg))
  }
)

export const beansApi = {
  list: (params) => api.get('/beans', { params }),
  get: (id) => api.get(`/beans/${id}`),
  create: (data) => api.post('/beans', data),
  update: (id, data) => api.put(`/beans/${id}`, data),
  remove: (id) => api.delete(`/beans/${id}`)
}

export const brewingsApi = {
  list: () => api.get('/brewings'),
  get: (id) => api.get(`/brewings/${id}`),
  create: (data) => api.post('/brewings', data),
  update: (id, data) => api.put(`/brewings/${id}`, data),
  remove: (id) => api.delete(`/brewings/${id}`),
  markFavorite: (id) => api.post(`/brewings/${id}/favorite`)
}

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
}

export const aiApi = {
  ping: () => api.post('/ai/ping'),
  brewingRecommend: (data) => api.post('/ai/brewing-recommend', data),
  beanRecommend: (data) => api.post('/ai/bean-recommend', data)
}

export default api
