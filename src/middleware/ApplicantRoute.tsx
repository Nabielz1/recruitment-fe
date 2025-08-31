import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

const ApplicantRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-10">Verifying user access...</div>;
  }

  // Jika pengguna bukan 'applicant', arahkan ke halaman utama/dashboard mereka.
  // RoleRedirect akan menangani pengarahan yang benar untuk admin.
  if (!user || user.role !== 'applicant') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ApplicantRoute;