// API层 - 对接真实后端API
// 服务器地址配置

import axios from 'axios'

const API_BASE = 'https://api.zhuoyusmart.top'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  res => res.data,
  err => {
    console.error('API错误:', err)
    return { code: -1, message: err.message || '网络错误' }
  }
)

// ===== 登录相关接口 =====

// 发送验证码
export const sendSmsCode = async ({ phone }) => {
  return api.post('/api/auth/sms/send', { phone })
}

// 手机号+验证码登录
export const loginWithSms = async ({ phone, code }) => {
  const res = await api.post('/api/auth/login/phone', { phone, code })
  if (res.code === 200 && res.data.token) {
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
  }
  return res
}

// 手机号+密码登录
export const loginWithPassword = async ({ phone, password }) => {
  const res = await api.post('/api/auth/login', { phone, password })
  if (res.code === 200 && res.data.token) {
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
  }
  return res
}

// 退出登录
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// 获取用户信息
export const getUserProfile = () => api.get('/api/user/profile')
export const getStudentProfile = () => api.get('/api/user/student-profile')
export const getLearningRecords = () => api.get('/api/user/learning-records')
export const getTestReports = () => api.get('/api/user/test-reports')
export const getGrowthRecords = () => api.get('/api/user/growth-records')

// 更新用户信息
export const updateUserProfile = (data) => api.put('/api/user/profile', data)

// ===== 运动项目 =====

export const getSportsTypes = () => api.get('/api/sports')

// ===== 教练 =====

export const getCoaches = (params = {}) => api.get('/api/coaches', { params })

export const getCoachById = (id) => api.get(`/api/coaches/${id}`)

export const getPopularCoaches = () => api.get('/api/coaches/popular')

// ===== 课程 =====

export const getCourses = (params = {}) => api.get('/api/courses', { params })

export const getCourseById = (id) => api.get(`/api/courses/${id}`)

// ===== 机构 =====

export const getInstitutions = () => api.get('/api/organizations')

export const getInstitutionById = (id) => api.get(`/api/organizations/${id}`)

// ===== 订单 =====

export const getOrders = () => api.get('/api/user/orders')

export const createOrder = (data) => api.post('/api/orders', data)

export const payOrder = (orderId, paymentMethod) => api.post(`/api/orders/${orderId}/pay`, { payment_method: paymentMethod })

// ===== 收藏 =====

export const getFavorites = (favType) => api.get('/api/user/favorites', { params: { fav_type: favType } })

export const addFavorite = (favType, favId) => api.post('/api/user/favorites', { fav_type: favType, fav_id: favId, action: 'add' })

export const removeFavorite = (favType, favId) => api.post('/api/user/favorites', { fav_type: favType, fav_id: favId, action: 'remove' })

export const joinInstitution = (data) => request.post('/api/join', data)
