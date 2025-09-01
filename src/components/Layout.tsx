import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../services/authService';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    logout();
    navigate('/login');
  };

  const activeLinkStyle = "inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium text-gray-900";
  const inactiveLinkStyle = "inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700";
  
  const activeAdminLinkStyle = "inline-flex items-center px-1 pt-1 border-b-2 border-red-500 text-sm font-medium text-red-600";
  const inactiveAdminLinkStyle = "inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-red-500 hover:border-red-300 hover:text-red-700";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center font-bold text-xl text-indigo-600">
                Recruitment
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {user && user.role === 'applicant' && (
                  <>
                    <NavLink to="/dashboard" end className={({ isActive }) => isActive ? activeLinkStyle : inactiveLinkStyle}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => isActive ? activeLinkStyle : inactiveLinkStyle}>
                      Profile
                    </NavLink>
                    <NavLink to="/my-applications" className={({ isActive }) => isActive ? activeLinkStyle : inactiveLinkStyle}>
                      My Applications
                    </NavLink>
                    {/* Kembalikan Menu Upload Documents */}
                    <NavLink to="/uploads" className={({ isActive }) => isActive ? activeLinkStyle : inactiveLinkStyle}>
                      Upload Documents
                    </NavLink>
                  </>
                )}
                {user && (user.role === 'admin' || user.role === 'hrd') && (
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? activeAdminLinkStyle : inactiveAdminLinkStyle}>
                        Admin Dashboard
                    </NavLink>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <span className="text-sm text-gray-600 mr-4">Welcome, {user?.email}</span>
              <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;