import { Routes, Route } from 'react-router-dom';

// Halaman
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import UploadsPage from './pages/UploadPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Komponen Layout
import Layout from './components/Layout';

// Middleware & Proteksi Rute (Path baru)
import ProtectedRoute from './middleware/ProtectedRoute';
import AdminRoute from './middleware/AdminRoute';
import RoleRedirect from './middleware/RoleRedirect';

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
        {/* Halaman index sekarang adalah pengarah otomatis */}
        <Route index element={<RoleRedirect />} />
        
        {/* Rute untuk Applicant */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="my-applications" element={<MyApplicationsPage />} />
        <Route path="uploads" element={<UploadsPage />} />
        
        {/* Rute khusus Admin (dilindungi oleh AdminRoute) */}
        <Route 
          path="admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboardPage />
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