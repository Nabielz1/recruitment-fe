import { useEffect, useState, useCallback } from 'react';
import UploadItem from '../components/UploadItem';
import { getProfile } from '../services/profileService';
import type { ApplicantProfile } from '../types';

const documentList = [
  { label: 'Profile Photo (.jpg, .png)', uploadType: 'photo', key: 'photo_path' },
  { label: 'Diploma Certificate (.pdf, .docx)', uploadType: 'diploma', key: 'diploma_path' },
  { label: 'Academic Transcript (.pdf)', uploadType: 'transcript', key: 'transcript_path' },
  { label: 'Reference Letter (Optional)', uploadType: 'reference_letter', key: 'reference_letter_path' },
  { label: 'ID Card (KTP) (.jpg, .pdf)', uploadType: 'id_card', key: 'id_card_path' },
  { label: 'NPWP/Jamsostek (Optional)', uploadType: 'npwp_jamsostek', key: 'npwp_jamsostek_path' },
  { label: 'Application Form (Optional)', uploadType: 'application_form', key: 'application_form_path' },
];

const UploadsPage = () => {
  const [profile, setProfile] = useState<Partial<ApplicantProfile>>({});
  const [loading, setLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);
  
  const handleUploadSuccess = () => {
    console.log("Upload success, refetching profile...");
    fetchProfileData();
  };

  if (loading) {
    return <p className="text-center">Loading document status...</p>;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Documents</h1>
      <p className="text-gray-600 mb-6">Please upload all the required documents below. Max file size is 10MB.</p>

      <div className="space-y-4">
        {documentList.map((doc) => (
          <UploadItem
            key={doc.uploadType}
            label={doc.label}
            uploadType={doc.uploadType}
            existingFilePath={profile[doc.key as keyof ApplicantProfile] as string | undefined}
            onUploadSuccess={handleUploadSuccess}
          />
        ))}
      </div>
    </div>
  );
};

export default UploadsPage;