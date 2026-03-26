import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getToken } from './utils/auth'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Product from './pages/Product'
import Category from './pages/Category'
import Order from './pages/Order'
import User from './pages/User'
import Banner from './pages/Banner'
import Coupon from './pages/Coupon'
import Admin from './pages/Admin'

/** 路由守卫：未登录重定向到登录页 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  return getToken() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="product" element={<Product />} />
          <Route path="category" element={<Category />} />
          <Route path="order" element={<Order />} />
          <Route path="user" element={<User />} />
          <Route path="banner" element={<Banner />} />
          <Route path="coupon" element={<Coupon />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
