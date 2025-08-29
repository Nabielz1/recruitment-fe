import { useEffect, useState } from 'react';
import type { JobApplication } from '../../types';
import { getAdminApplications, updateApplicationStatus } from '../../services/adminService';
import "../../App.css";

const AdminDashboardPage = () => {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await getAdminApplications();
            setApplications(data.applications);
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

    // Fungsi untuk menangani update status
    const handleStatusUpdate = async (id: number, status: 'accepted' | 'rejected') => {
        const originalApplications = [...applications];
        
        // Update UI secara optimis untuk respons yang lebih cepat
        const updatedApplications = applications.map(app =>
            app.id === id ? { ...app, status: status } : app
        );
        setApplications(updatedApplications);

        try {
            await updateApplicationStatus(id, status, `Status updated by admin.`);
        } catch (error) {
            console.error(`Failed to update status for application ${id}`, error);
            // Jika gagal, kembalikan ke state semula dan tampilkan error
            setApplications(originalApplications);
            alert(`Failed to update status. Please try again.`);
        }
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
                            {/* Tambah kolom baru untuk Aksi */}
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
                                {/* Tambah sel baru untuk tombol Aksi */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {app.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate(app.id, 'accepted')} className="text-indigo-600 hover:text-indigo-900">Accept</button>
                                            <button onClick={() => handleStatusUpdate(app.id, 'rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                                        </>
                                    )}
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