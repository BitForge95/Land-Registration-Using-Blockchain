import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './index.css';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<UserLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      } />
    </Routes>
  );
}