import { useEffect, useState } from 'react';
import type { JobApplication } from '../types';
import { getUserApplications, submitApplication } from '../services/applicationService';
import "../App.css";

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchApplications = async () => {
        try {
            const data = await getUserApplications();
            // ===== PERUBAHAN DI SINI: Mengurutkan data berdasarkan tanggal terbaru =====
            const sortedData = data.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
            setApplications(sortedData);
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleSubmit = async () => {
        setMessage(null);
        try {
            await submitApplication();
            setMessage({ type: 'success', text: 'Application submitted successfully! It will appear below shortly.' });
            // Refresh list after a short delay to get the latest data
            setTimeout(() => fetchApplications(), 1000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to submit application. Please complete your profile first.' });
        }
    };
    
    if (loading) return <p>Loading applications...</p>;

    return (
        <div className="bg-white p-8 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Applications</h1>
                <button 
                    onClick={handleSubmit} 
                    className="px-5 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                    Submit New Application
                </button>
            </div>

            {message && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.length > 0 ? applications.map((app) => (
                            <tr key={app.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.position}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.applied_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${app.status === 'accepted' || app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                         app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {app.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No applications found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyApplicationsPage;