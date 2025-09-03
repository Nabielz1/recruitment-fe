import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import "../../styles/App.css";

const DashboardPage = () => {
    const { user } = useAuth();
    
    return (
        <div className="bg-white p-8 rounded-lg shadow">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.email}!</h1>
            <p className="mt-4 text-gray-600">
                This is your recruitment dashboard. From here you can manage your profile and view your job applications.
            </p>
            <div className="mt-6 space-x-4">
                <Link to="/profile" className="px-5 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Go to My Profile
                </Link>
                <Link to="/my-applications" className="px-5 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">
                    View My Applications
                </Link>
            </div>
        </div>
    );
};

export default DashboardPage;