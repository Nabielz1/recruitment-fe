import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminApplicationDetail } from '../../services/admin/adminService';
import type { JobApplication } from '../../types';
import "../../styles/App.css";

const ApplicationDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [application, setApplication] = useState<JobApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplicationDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await getAdminApplicationDetail(id);
                setApplication(data);
            } catch (err) {
                setError('Failed to load application details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicationDetail();
    }, [id]);

    if (loading) return <p className="text-center p-10">Loading application details...</p>;
    if (error) return <p className="text-center text-red-500 p-10">{error}</p>;
    if (!application) return <p className="text-center p-10">Application not found.</p>;

    const { profile } = application;

    const renderField = (label: string, value: any) => (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800">{value || '-'}</p>
        </div>
    );
    
    // Helper untuk menampilkan link dokumen
    const renderDocumentLink = (label: string, path?: string) => (
        <div className="py-2">
            <p className="text-sm font-medium text-gray-700">{label}</p>
            {path ? (
                <a href={`http://localhost:8000/${path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {path.split('/').pop()}
                </a>
            ) : (
                <p className="text-sm text-gray-500">- Not Uploaded -</p>
            )}
        </div>
    );


    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">Application Detail</h1>
                <Link to="/admin/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                    &larr; Back to Dashboard
                </Link>
            </div>

            {profile ? (
                <div className="space-y-10">
                    {/* --- Personal Information --- */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {renderField("Full Name", profile.full_name)}
                            {renderField("Sex", profile.sex)}
                            {renderField("Place of Birth", profile.place_of_birth)}
                            {renderField("Date of Birth", new Date(profile.date_of_birth).toLocaleDateString())}
                            {renderField("Religion", profile.religion)}
                            {renderField("Marital Status", profile.marital_status)}
                        </div>
                    </section>
                    
                    {/* --- Contact & Identity --- */}
                    <section>
                         <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Contact & Identity</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {renderField("Email", profile.email)}
                            {renderField("Cell Phone Number", profile.cell_phone_number)}
                            {renderField("WhatsApp Number", profile.whatsapp_number)}
                            {renderField("KTP Number", profile.ktp_number)}
                            {renderField("Citizenship", profile.citizenship)}
                            {renderField("Ethnicity", profile.ethnicity)}
                        </div>
                    </section>

                    {/* --- Address --- */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Address Information</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-800">Current Home Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                                    {renderField("Address", profile.home_address)}
                                    {renderField("City", profile.city)}
                                    {renderField("Postal Code", profile.postal_code)}
                                    {renderField("Ownership Status", profile.home_ownership_status)}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-medium text-gray-800">KTP Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                                    {renderField("Address", profile.ktp_address)}
                                    {renderField("City", profile.ktp_city)}
                                    {renderField("Postal Code", profile.ktp_postal_code)}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- Education --- */}
                    <section>
                         <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Education</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {renderField("Last Education", profile.last_education)}
                            {renderField("University Name", profile.university_name)}
                            {renderField("Major", profile.major)}
                            {renderField("GPA", profile.gpa)}
                        </div>
                    </section>
                    
                    {/* --- Job Preferences --- */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Job Preference & Others</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {renderField("First Choice Position", profile.first_choice_position)}
                           {renderField("Second Choice Position", profile.second_choice_position)}
                           {renderField("Daily Transportation", profile.daily_transportation)}
                        </div>
                    </section>

                    {/* --- Documents --- */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Uploaded Documents</h2>
                        <div className="divide-y">
                            {renderDocumentLink("Profile Photo", profile.photo_path)}
                            {renderDocumentLink("Diploma Certificate", profile.diploma_path)}
                            {renderDocumentLink("Academic Transcript", profile.transcript_path)}
                            {renderDocumentLink("Reference Letter", profile.reference_letter_path)}
                            {renderDocumentLink("ID Card (KTP)", profile.id_card_path)}
                            {renderDocumentLink("NPWP/Jamsostek", profile.npwp_jamsostek_path)}
                            {renderDocumentLink("Application Form", profile.application_form_path)}
                        </div>
                    </section>

                </div>
            ) : (
                <p>No profile data available for this application.</p>
            )}
        </div>
    );
};

export default ApplicationDetailPage;