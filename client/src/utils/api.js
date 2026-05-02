import axios from 'axios'

const API = axios.create({
  baseURL: 'https://neutrona-production.up.railway.app/api',
});

// Automatically attach token to every request if logged in
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

// AUTH
export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', data)

// BANKING
export const getAccount = () => API.get('/banking/account')
export const deposit = (data) => API.post('/banking/deposit', data)
export const withdraw = (data) => API.post('/banking/withdraw', data)
export const getTransactions = () => API.get('/banking/transactions')
export const getFraudAlerts = () => API.get('/banking/fraud-alerts')
export const sendChatMessage = (data) => API.post('/chat/message', data)
export const getAdminStats = () => API.get('/admin/stats')
export const getAdminUsers = () => API.get('/admin/users')
export const getAdminTransactions = () => API.get('/admin/transactions')
export const getAdminFraudAlerts = () => API.get('/admin/fraud-alerts')
export const getExpenseSummary = () => API.get('/expense/summary')
export const setBudget = (data) => API.post('/expense/budget', data)
export const getBudgets = () => API.get('/expense/budgets')