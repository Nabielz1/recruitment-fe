import React, { useEffect, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { ApplicantProfile } from '../../types';
import { getProfile, createOrUpdateProfile } from '../../services/user/profileService';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import "../../App.css";

const ProfilePage: React.FC = () => {
    // State untuk mengelola bagian mana yang aktif, default ke 'personal-information'
    const [activeSection, setActiveSection] = useState('personal-information');
    
    // Kembalikan form ke bentuk sederhana tanpa useFieldArray
    const { register, handleSubmit, reset, watch } = useForm<Partial<ApplicantProfile>>();

    const [isLoading, setIsLoading] = useState(true);
    const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    const watchedFields = watch();

    // Kalkulasi progress bar
    const { progress, completenessText } = useMemo(() => {
        const requiredFields: (keyof ApplicantProfile)[] = [
            'full_name', 'sex', 'place_of_birth', 'date_of_birth', 'religion', 'marital_status',
            'email', 'cell_phone_number', 'ktp_number', 'citizenship', 'ethnicity',
            'home_address', 'city', 'postal_code', 'home_ownership_status',
            'ktp_address', 'ktp_city', 'ktp_postal_code',
            'first_choice_position', 'daily_transportation',
            // Tambahkan field pendidikan tunggal ke dalam pengecekan
            'last_education', 'university_name', 'major', 'gpa'
        ];

        let completedCount = 0;
        requiredFields.forEach(field => {
            if (watchedFields[field]) {
                completedCount++;
            }
        });

        const totalFields = requiredFields.length;
        const progress = Math.round((completedCount / totalFields) * 100);
        
        let completenessText = "Kurang";
        if (progress > 95) completenessText = "Lengkap";
        else if (progress > 60) completenessText = "Cukup";

        return { progress, completenessText };
    }, [watchedFields]);

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
                reset(profile);
            }
        } catch (error) {
            console.info("No existing profile found.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProfileData();
    }, [reset]);

    const onSubmit: SubmitHandler<Partial<ApplicantProfile>> = async (data) => {
        setServerMessage(null);
        setIsLoading(true);
        try {
            await createOrUpdateProfile(data);
            setServerMessage({ type: 'success', text: 'Profile has been saved successfully!' });
            fetchProfileData();
        } catch (error: any) {
            setServerMessage({ type: 'error', text: error.response?.data?.error || "An error occurred while saving." });
        } finally {
            setIsLoading(false);
            window.scrollTo(0, 0);
        }
    };

    if (isLoading) {
        return <p className="text-center">Loading profile data...</p>;
    }

    const sections = [
        { key: 'personal-information', label: 'Personal Information' },
        { key: 'contact-identity', label: 'Contact & Identity' },
        { key: 'address-information', label: 'Address Information' },
        { key: 'education', label: 'Education' },
        { key: 'job-preferences-others', label: 'Job Preferences & Others' }
    ];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-8">
            {/* Kolom Sidebar Kiri */}
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
                        {sections.map(section => (
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

            {/* Kolom Konten Kanan */}
            <main className="w-full md:w-2/3 lg:w-3/4 bg-white p-6 sm:p-8 rounded-lg shadow-md">
                {serverMessage && (
                    <div className={`p-4 mb-6 text-sm rounded-lg ${serverMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {serverMessage.text}
                    </div>
                )}
                
                <div className={activeSection !== 'personal-information' ? 'hidden' : ''}>
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Nama Lengkap" {...register('full_name')} />
                            <Select label="Gender" options={sexOptions} {...register('sex')} />
                            <Input label="Tempat Lahir" {...register('place_of_birth')} />
                            <Input label="Tanggal Lahir" type="date" {...register('date_of_birth')} />
                            <Select label="Agama" options={religionOptions} {...register('religion')} />
                            <Select label="Status Pernikahan" options={maritalStatusOptions} {...register('marital_status')} />
                        </div>
                    </section>
                </div>
                
                <div className={activeSection !== 'contact-identity' ? 'hidden' : ''}>
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Contact & Identity</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Email" type="email" {...register('email')} />
                            <Input label="Nomor HP" {...register('cell_phone_number')} />
                            <Input label="Nomor WhatsApp" {...register('whatsapp_number')} />
                            <Input label="Nomor KTP" {...register('ktp_number')} />
                            <Input label="Kewarganegaraan" {...register('citizenship')} />
                            <Input label="Suku" {...register('ethnicity')} />
                        </div>
                    </section>
                </div>

                <div className={activeSection !== 'address-information' ? 'hidden' : ''}>
                     <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Address Information</h2>
                        <div className="space-y-6">
                            <div className="p-4 border rounded-md">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Current Home Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <Input label="Alamat Rumah" {...register('home_address')} />
                                   <Input label="Kota" {...register('city')} />
                                   <Input label="Kode Pos" {...register('postal_code')} />
                                   <Select label="Status Kepemilikan Rumah" options={homeOwnershipOptions} {...register('home_ownership_status')} />
                                </div>
                            </div>
                            <div className="p-4 border rounded-md">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Address according to KTP</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <Input label="Alamat KTP" {...register('ktp_address')} />
                                   <Input label="Kota KTP" {...register('ktp_city')} />
                                   <Input label="Kode Pos KTP" {...register('ktp_postal_code')} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                 <div className={activeSection !== 'education' ? 'hidden' : ''}>
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Education</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Pendidikan Terakhir" {...register('last_education')} />
                            <Input label="Nama Universitas" {...register('university_name')} />
                            <Input label="Jurusan" {...register('major')} />
                            <Input label="IPK" type="text" {...register('gpa', { setValueAs: v => String(v) })} />
                        </div>
                    </section>
                </div>

                <div className={activeSection !== 'job-preferences-others' ? 'hidden' : ''}>
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Job Preference & Others</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Posisi Pilihan Pertama" {...register('first_choice_position')} />
                            <Input label="Posisi Pilihan Kedua" {...register('second_choice_position')} />
                            <Input label="Transportasi Harian" {...register('daily_transportation')} />
                        </div>
                    </section>
                </div>
            </main>
        </form>
    );
};

export default ProfilePage;