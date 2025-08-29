import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (user.role !== 'admin' && user.role !== 'hrd')) {
    // Arahkan ke halaman utama jika bukan admin/hrd
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;