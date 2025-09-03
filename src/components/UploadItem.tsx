import React, { useState } from 'react';
import { uploadFile } from '../services/user/uploadService';

interface UploadItemProps {
  label: string;
  uploadType: string;
  existingFilePath?: string;
  onUploadSuccess: () => void; // Callback untuk memberitahu parent
}

const UploadItem: React.FC<UploadItemProps> = ({ label, uploadType, existingFilePath, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      // Validasi ukuran file (maks 10MB)
      if (event.target.files[0].size > 10 * 1024 * 1024) {
        setStatus('error');
        setMessage('File is too large. Max size is 10MB.');
        setSelectedFile(null);
        event.target.value = ''; // Reset input file
        return;
      }
      setSelectedFile(event.target.files[0]);
      setStatus('idle');
      setMessage(`Ready to upload: ${event.target.files[0].name}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setMessage(`Uploading ${selectedFile.name}...`);

    try {
      await uploadFile(selectedFile, uploadType);
      setStatus('success');
      setMessage(`Successfully replaced document.`);
      setSelectedFile(null); // Reset file input
      onUploadSuccess(); // Panggil callback
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Upload failed. Please try again.');
    }
  };
  
  const existingFileName = existingFilePath ? existingFilePath.split(/[\\/]/).pop() : '';

  return (
    <div className="p-4 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-grow">
        <label className="font-semibold text-gray-700">{label}</label>
        
        {/* Tampilkan status file yang sudah ada */}
        {existingFileName && (
          <div className="flex items-center mt-1 text-sm text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium truncate max-w-xs" title={existingFileName}>{existingFileName}</span>
          </div>
        )}

        {/* Tampilkan pesan status proses */}
        {message && <p className={`text-sm mt-1 ${
            status === 'error' ? 'text-red-600' : 
            status === 'success' ? 'text-green-600' : 'text-blue-600'
        }`}>{message}</p>}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <label className="flex-grow sm:flex-grow-0 cursor-pointer text-center px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
          Choose File
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || status === 'uploading'}
          className="flex-grow sm:flex-grow-0 px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {status === 'uploading' ? 'Uploading...' : existingFileName ? 'Replace' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default UploadItem;