import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Admin from './pages/Admin'
import Expense from './pages/Expense'
import Settings from './pages/Settings'
import BillPayment from './pages/BillPayment'

const PrivateRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />
      <Route path="/analytics" element={
        <PrivateRoute><Analytics /></PrivateRoute>
      } />
      <Route path="/admin" element={
        <PrivateRoute><Admin /></PrivateRoute>
      } />
      <Route path="/expense" element={
        <PrivateRoute><Expense /></PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="/settings" element={
  <PrivateRoute><Settings /></PrivateRoute>
} />
    <Route path="/bills" element={
        <PrivateRoute><BillPayment /></PrivateRoute>
} />
    </Routes>
  )
}