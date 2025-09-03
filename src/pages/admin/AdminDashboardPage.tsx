import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { JobApplication } from '../../types';
import { getAdminApplications, updateApplicationStatus, deleteApplication } from '../../services/admin/adminService';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import "../../App.css";

const AdminDashboardPage: React.FC = () => {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await getAdminApplications();
            const sortedApplications = data.applications.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
            setApplications(sortedApplications);
            setError(null);
        } catch (error) {
            console.error("Failed to fetch admin applications", error);
            setError("Failed to load applications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleStatusUpdate = (id: number, status: 'accepted' | 'rejected') => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to ${status} this application. This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, ${status} it!`,
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const originalApplications = [...applications];
                const updatedApplications = applications.map(app =>
                    app.id === id ? { ...app, status: status } : app
                );
                setApplications(updatedApplications);

                try {
                    await updateApplicationStatus(id, status, `Status updated by admin.`);
                    Swal.fire(
                        'Success!',
                        `The application has been ${status}.`,
                        'success'
                    );
                } catch (error) {
                    console.error(`Failed to update status for application ${id}`, error);
                    setApplications(originalApplications);
                    Swal.fire(
                        'Failed!',
                        'Failed to update status. Please try again.',
                        'error'
                    );
                }
            }
        });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Are you sure you want to delete this?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const originalApplications = [...applications];
                const updatedApplications = applications.filter(app => app.id !== id);
                setApplications(updatedApplications);

                try {
                    await deleteApplication(id);
                    Swal.fire(
                        'Deleted!',
                        'The application has been deleted.',
                        'success'
                    );
                } catch (error) {
                    console.error(`Failed to delete application ${id}`, error);
                    setApplications(originalApplications);
                    Swal.fire(
                        'Failed!',
                        'Failed to delete the application. Please try again.',
                        'error'
                    );
                }
            }
        });
    };
    
    if (loading) return <p className="text-center">Loading all applications...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard: All Applications</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map((app) => (
                            <tr key={app.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.user?.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.position}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.applied_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${app.status === 'accepted' || app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                         app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {app.status === 'pending' ? (
                                        <div className="flex items-center space-x-4">
                                            <button onClick={() => handleStatusUpdate(app.id, 'accepted')} className="text-indigo-600 hover:text-indigo-900">Accept</button>
                                            <button onClick={() => handleStatusUpdate(app.id, 'rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-4">
                                        <Link to={`/admin/application/${app.id}`} className="text-blue-600 hover:text-blue-900">
                                            Detail
                                        </Link>
                                        <button onClick={() => handleDelete(app.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboardPage;