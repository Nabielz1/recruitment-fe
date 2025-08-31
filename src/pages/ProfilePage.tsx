import React, { useEffect, useState, useMemo } from 'react';
import { useForm, type SubmitHandler, useFieldArray } from 'react-hook-form';
import type { ApplicantProfile } from '../types';
import { getProfile, createOrUpdateProfile } from '../services/profileService';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import UploadItem from '../components/UploadItem';

// Daftar dokumen untuk bagian upload
const documentList = [
  { label: 'Profile Photo (.jpg, .png)', uploadType: 'photo', key: 'photo_path' },
  { label: 'Diploma Certificate (.pdf, .docx)', uploadType: 'diploma', key: 'diploma_path' },
  { label: 'Academic Transcript (.pdf)', uploadType: 'transcript', key: 'transcript_path' },
  { label: 'Reference Letter (Optional)', uploadType: 'reference_letter', key: 'reference_letter_path' },
  { label: 'ID Card (KTP) (.jpg, .pdf)', uploadType: 'id_card', key: 'id_card_path' },
  { label: 'NPWP/Jamsostek (Optional)', uploadType: 'npwp_jamsostek', key: 'npwp_jamsostek_path' },
  { label: 'Application Form (Optional)', uploadType: 'application_form', key: 'application_form_path' },
];

// Daftar menu untuk sidebar navigasi
const profileSections = [
    { key: 'personal', label: 'Personal Information' },
    { key: 'contact', label: 'Contact & Identity' },
    { key: 'address', label: 'Address Information' },
    { key: 'education', label: 'Education' },
    { key: 'preferences', label: 'Job Preferences & Others' },
    { key: 'documents', label: 'Documents' },
];

const ProfilePage: React.FC = () => {
    const [activeSection, setActiveSection] = useState('personal');
    const [editModes, setEditModes] = useState<Record<string, boolean>>({
        personal: false,
        contact: false,
        address: false,
        preferences: false,
    });
    
    const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);

    const { register, handleSubmit, reset, control, watch } = useForm<Partial<ApplicantProfile>>({
        defaultValues: {
            education: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "education"
    });

    const [isLoading, setIsLoading] = useState(true);
    const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    const watchedFields = watch();
    const educationData = watchedFields.education || [];

    const { progress, completenessText } = useMemo(() => {
        const requiredFields: (keyof ApplicantProfile)[] = [
            'full_name', 'sex', 'place_of_birth', 'date_of_birth', 'religion', 'marital_status',
            'email', 'cell_phone_number', 'ktp_number', 'citizenship', 'ethnicity',
            'home_address', 'city', 'postal_code', 'home_ownership_status',
            'ktp_address', 'ktp_city', 'ktp_postal_code',
            'first_choice_position', 'daily_transportation',
        ];

        let completedCount = 0;
        requiredFields.forEach(field => {
            if (watchedFields[field]) {
                completedCount++;
            }
        });

        if (educationData && educationData.length > 0) {
            const edu = educationData[0];
            if (edu?.last_education && edu?.university_name && edu?.major && edu?.gpa) {
                completedCount += 4;
            }
        }
        const totalFields = requiredFields.length + (educationData.length > 0 ? 4 : 0);
        const progress = totalFields > 0 ? Math.round((completedCount / totalFields) * 100) : 0;
        
        let completenessText = "Kurang";
        if (progress > 95) completenessText = "Lengkap";
        else if (progress > 60) completenessText = "Cukup";

        return { progress, completenessText };
    }, [watchedFields, educationData]);

    const sexOptions = [ { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }];
    const religionOptions = [ { value: 'Islam', label: 'Islam' }, { value: 'Christianity', label: 'Christianity' }, { value: 'Catholicism', label: 'Catholicism' }, { value: 'Hinduism', label: 'Hinduism' }, { value: 'Buddhism', label: 'Buddhism' }, { value: 'Confucianism', label: 'Confucianism' }, { value: 'Other', label: 'Other' }];
    const maritalStatusOptions = [ { value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }];
    const homeOwnershipOptions = [ { value: 'Owned', label: 'Owned' }, { value: 'Rented', label: 'Rented' }, { value: 'Living with Parents', label: 'Living with Parents' }];

    const fetchProfileData = async () => {
        setIsLoading(true);
        try {
            const profile = await getProfile();
            if (profile) {
                if (profile.date_of_birth) {
                    profile.date_of_birth = profile.date_of_birth.split('T')[0];
                }
                if (profile.education) {
                    profile.education = profile.education.map(edu => ({
                        ...edu,
                        gpa: String(edu.gpa)
                    }));
                }
                reset(profile);
            }
        } catch (error) {
            console.info("No existing profile found.");
            setEditModes(prev => ({ ...prev, personal: true }));
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProfileData();
    }, [reset]);

    const toggleEditMode = (section: string) => {
        setEditModes(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const onSubmit: SubmitHandler<Partial<ApplicantProfile>> = async (data) => {
        setServerMessage(null);
        setIsLoading(true);
        try {
            await createOrUpdateProfile(data);
            setServerMessage({ type: 'success', text: 'Profile has been saved successfully!' });
            setEditingEducationIndex(null);
            fetchProfileData();
            setEditModes({ personal: false, contact: false, address: false, preferences: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "An error occurred while saving.";
            setServerMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsLoading(false);
            window.scrollTo(0, 0);
        }
    };

    if (isLoading) {
        return <p className="text-center">Loading profile data...</p>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-1/3 lg:w-1/4 space-y-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold">Kelengkapan Data: <span className="text-blue-600 font-bold">{completenessText}</span></h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500">Profil kamu sudah {completenessText.toLowerCase()}. Silakan kirimkan lamaran Anda sekarang juga!</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <ul className="space-y-1">
                        {profileSections.map(section => (
                            <li key={section.key}>
                                <button
                                    type="button"
                                    onClick={() => setActiveSection(section.key)}
                                    className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 ${
                                        activeSection === section.key 
                                        ? 'bg-blue-500 text-white font-semibold' 
                                        : 'hover:bg-gray-100'
                                    }`}
                                >
                                    {section.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                 <button type="submit" disabled={isLoading} className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                    {isLoading ? 'Saving...' : 'Simpan Perubahan'}
                </button>
            </aside>

            <main className="w-full md:w-2/3 lg:w-3/4 bg-white p-6 sm:p-8 rounded-lg shadow-md">
                {serverMessage && (
                    <div className={`p-4 mb-6 text-sm rounded-lg ${serverMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {serverMessage.text}
                    </div>
                )}
                
                <div className={activeSection !== 'personal' ? 'hidden' : ''}>
                    <section>
                        <div className="flex justify-between items-center mb-6">
                           <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                           <button type="button" onClick={() => toggleEditMode('personal')} className="text-blue-600 hover:text-blue-800 font-semibold">Ubah Data</button>
                        </div>
                        <fieldset disabled={!editModes.personal} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Full Name" {...register('full_name', { required: true })} />
                            <Select label="Sex" options={sexOptions} {...register('sex', { required: true })} />
                            <Input label="Place of Birth" {...register('place_of_birth', { required: true })} />
                            <Input label="Date of Birth" type="date" {...register('date_of_birth', { required: true })} />
                            <Select label="Religion" options={religionOptions} {...register('religion', { required: true })} />
                            <Select label="Marital Status" options={maritalStatusOptions} {...register('marital_status', { required: true })} />
                        </fieldset>
                    </section>
                </div>
                
                <div className={activeSection !== 'contact' ? 'hidden' : ''}>
                     <section>
                        <div className="flex justify-between items-center mb-6">
                           <h2 className="text-xl font-bold text-gray-800">Contact & Identity</h2>
                           <button type="button" onClick={() => toggleEditMode('contact')} className="text-blue-600 hover:text-blue-800 font-semibold">Ubah Data</button>
                        </div>
                        <fieldset disabled={!editModes.contact} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Email" type="email" {...register('email', { required: true })} />
                            <Input label="Cell Phone Number" {...register('cell_phone_number', { required: true })} />
                            <Input label="WhatsApp Number" {...register('whatsapp_number')} />
                            <Input label="KTP Number" {...register('ktp_number', { required: true })} />
                            <Input label="Citizenship" {...register('citizenship', { required: true })} />
                            <Input label="Ethnicity" {...register('ethnicity', { required: true })} />
                        </fieldset>
                    </section>
                </div>

                <div className={activeSection !== 'address' ? 'hidden' : ''}>
                     <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Address Information</h2>
                            <button type="button" onClick={() => toggleEditMode('address')} className="text-blue-600 hover:text-blue-800 font-semibold">Ubah Data</button>
                        </div>
                        <fieldset disabled={!editModes.address} className="space-y-6">
                            <div className="p-4 border rounded-md">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Current Home Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <Input label="Home Address" {...register('home_address', { required: true })} />
                                   <Input label="City" {...register('city', { required: true })} />
                                   <Input label="Postal Code" {...register('postal_code', { required: true })} />
                                   <Select label="Home Ownership Status" options={homeOwnershipOptions} {...register('home_ownership_status', { required: true })} />
                                </div>
                            </div>
                            <div className="p-4 border rounded-md">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Address according to KTP</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <Input label="KTP Address" {...register('ktp_address', { required: true })} />
                                   <Input label="KTP City" {...register('ktp_city', { required: true })} />
                                   <Input label="KTP Postal Code" {...register('ktp_postal_code', { required: true })} />
                                </div>
                            </div>
                        </fieldset>
                    </section>
                </div>

                <div className={activeSection !== 'education' ? 'hidden' : ''}>
                    <section>
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Pendidikan*</h2>
                                <p className="text-sm text-gray-500">maks. 3</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => {
                                    if (fields.length < 3) {
                                        append({ last_education: '', university_name: '', major: '', gpa: '' });
                                        setEditingEducationIndex(fields.length);
                                    }
                                }}
                                disabled={fields.length >= 3}
                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                Tambah
                            </button>
                        </div>
                        
                        <div className="mt-4 space-y-4">
                        {fields.map((item, index) => (
                            <div key={item.id}>
                                {editingEducationIndex === index ? (
                                    <div className="p-4 border rounded-md relative animate-fade-in">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-800">Mengubah Pendidikan #{index + 1}</h3>
                                            <button type="button" onClick={() => setEditingEducationIndex(null)} className="text-green-600 hover:text-green-800 font-semibold">Selesai</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="Tingkat Pendidikan" {...register(`education.${index}.last_education` as const, { required: true })} />
                                            <Input label="Nama Universitas" {...register(`education.${index}.university_name` as const, { required: true })} />
                                            <Input label="Jurusan" {...register(`education.${index}.major` as const, { required: true })} />
                                            <Input 
                                                label="IPK" 
                                                type="text" 
                                                {...register(`education.${index}.gpa` as const, { 
                                                    required: true,
                                                    setValueAs: v => String(v) 
                                                })} 
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 border rounded-md flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{educationData[index]?.university_name || 'Nama Universitas'}</h3>
                                            <p className="text-gray-600">{educationData[index]?.last_education} / {educationData[index]?.major}</p>
                                            <p className="text-gray-600">GPA {educationData[index]?.gpa}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setEditingEducationIndex(index)} className="text-gray-400 hover:text-blue-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                            </button>
                                            <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        </div>
                    </section>
                </div>

                <div className={activeSection !== 'preferences' ? 'hidden' : ''}>
                     <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Job Preference & Others</h2>
                            <button type="button" onClick={() => toggleEditMode('preferences')} className="text-blue-600 hover:text-blue-800 font-semibold">Ubah Data</button>
                        </div>
                        <fieldset disabled={!editModes.preferences} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="First Choice Position" {...register('first_choice_position')} />
                            <Input label="Second Choice Position" {...register('second_choice_position')} />
                            <Input label="Daily Transportation" {...register('daily_transportation', { required: true })} />
                        </fieldset>
                    </section>
                </div>

                <div className={activeSection !== 'documents' ? 'hidden' : ''}>
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Upload Documents</h2>
                        <p className="text-gray-600 mb-6">Please upload all the required documents below. Max file size is 10MB.</p>
                        <div className="space-y-4">
                            {documentList.map((doc) => (
                            <UploadItem
                                key={doc.uploadType}
                                label={doc.label}
                                uploadType={doc.uploadType}
                                existingFilePath={watchedFields[doc.key as keyof ApplicantProfile] as string | undefined}
                                onUploadSuccess={fetchProfileData}
                            />
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </form>
    );
};

export default ProfilePage;