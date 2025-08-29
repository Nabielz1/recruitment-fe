import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin' || user.role === 'hrd') {
        // Jika admin, paksa arahkan ke admin dashboard
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Jika applicant, arahkan ke dashboard mereka
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Tampilkan pesan loading selagi proses pengarahan berjalan
  return <div className="text-center p-10">Loading your dashboard...</div>;
};

export default RoleRedirect;