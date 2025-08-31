import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/Layout';
import ProtectedRoute from './middleware/ProtectedRoute';
import AdminRoute from './middleware/AdminRoute';
import ApplicantRoute from './middleware/ApplicantRoute'; // <-- 1. Import ApplicantRoute
import RoleRedirect from './middleware/RoleRedirect';
import ApplicationDetailPage from './pages/admin/ApplicationDetailPage';

function App() {
  return (
    <Routes>
      {/* Rute Publik */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rute yang Dilindungi */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleRedirect />} />
        
        {/* ===== 2. Lindungi Rute Applicant dengan ApplicantRoute ===== */}
        <Route path="dashboard" element={<ApplicantRoute><DashboardPage /></ApplicantRoute>} />
        <Route path="profile" element={<ApplicantRoute><ProfilePage /></ApplicantRoute>} />
        <Route path="my-applications" element={<ApplicantRoute><MyApplicationsPage /></ApplicantRoute>} />
        
        {/* Rute khusus Admin (sudah dilindungi oleh AdminRoute) */}
        <Route 
          path="admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/application/:id" 
          element={
            <AdminRoute>
              <ApplicationDetailPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* Rute jika halaman tidak ditemukan */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;