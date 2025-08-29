import { Link } from 'react-router-dom';
import "../App.css";

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-indigo-600">404</h1>
                <p className="text-2xl mt-4 font-medium text-gray-800">Page Not Found</p>
                <p className="mt-2 text-gray-600">Sorry, the page you are looking for does not exist.</p>
                <Link to="/" className="mt-6 inline-block px-6 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;