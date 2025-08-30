import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { ApplicantProfile } from '../types';
import { getProfile, createOrUpdateProfile } from '../services/profileService';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const ProfilePage: React.FC = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<ApplicantProfile>>();
    const [isLoading, setIsLoading] = useState(true);
    const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const sexOptions = [ { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }];
    const religionOptions = [ { value: 'Islam', label: 'Islam' }, { value: 'Christianity', label: 'Christianity' }, { value: 'Catholicism', label: 'Catholicism' }, { value: 'Hinduism', label: 'Hinduism' }, { value: 'Buddhism', label: 'Buddhism' }, { value: 'Confucianism', label: 'Confucianism' }, { value: 'Other', label: 'Other' }];
    const maritalStatusOptions = [ { value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }];
    const homeOwnershipOptions = [ { value: 'Owned', label: 'Owned' }, { value: 'Rented', label: 'Rented' }, { value: 'Living with Parents', label: 'Living with Parents' }];

    useEffect(() => {
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
                console.info("No existing profile found. User can create a new one.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
    }, [reset]);

    const onSubmit: SubmitHandler<Partial<ApplicantProfile>> = async (data) => {
        setServerMessage(null);
        setIsLoading(true);
        try {
            await createOrUpdateProfile(data);
            setServerMessage({ type: 'success', text: 'Profile has been saved successfully!' });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "An error occurred while saving the profile.";
            setServerMessage({ type: 'error', text: errorMessage });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !Object.keys(errors).length) {
        return <p className="text-center">Loading profile data...</p>;
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Applicant Profile</h1>
            
            {serverMessage && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${serverMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {serverMessage.text}
                </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                <section>
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Input label="Full Name" id="full_name" {...register('full_name', { required: true })} />
                        <Select label="Sex" id="sex" options={sexOptions} {...register('sex', { required: true })} />
                        <Input label="Place of Birth" id="place_of_birth" {...register('place_of_birth', { required: true })} />
                        <Input label="Date of Birth" id="date_of_birth" type="date" {...register('date_of_birth', { required: true })} />
                        <Select label="Religion" id="religion" options={religionOptions} {...register('religion', { required: true })} />
                        <Select label="Marital Status" id="marital_status" options={maritalStatusOptions} {...register('marital_status', { required: true })} />
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Contact & Identity</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Input label="Email" id="email" type="email" {...register('email', { required: true })} />
                        <Input label="Cell Phone Number" id="cell_phone_number" {...register('cell_phone_number', { required: true })} />
                        <Input label="WhatsApp Number" id="whatsapp_number" {...register('whatsapp_number')} />
                        <Input label="KTP Number" id="ktp_number" {...register('ktp_number', { required: true })} />
                        <Input label="Citizenship" id="citizenship" {...register('citizenship', { required: true })} />
                        <Input label="Ethnicity" id="ethnicity" {...register('ethnicity', { required: true })} />
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Address Information</h2>
                    
                    <div className="mt-4 p-4 border rounded-md">
                        <h3 className="font-medium text-gray-800">Current Home Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                           <Input label="Home Address" id="home_address" {...register('home_address', { required: true })} />
                           <Input label="City" id="city" {...register('city', { required: true })} />
                           <Input label="Postal Code" id="postal_code" {...register('postal_code', { required: true })} />
                           <Select label="Home Ownership Status" id="home_ownership_status" options={homeOwnershipOptions} {...register('home_ownership_status', { required: true })} />
                        </div>
                    </div>
                    
                    <div className="mt-6 p-4 border rounded-md">
                        <h3 className="font-medium text-gray-800">Address according to KTP</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                           <Input label="KTP Address" id="ktp_address" {...register('ktp_address', { required: true })} />
                           <Input label="KTP City" id="ktp_city" {...register('ktp_city', { required: true })} />
                           <Input label="KTP Postal Code" id="ktp_postal_code" {...register('ktp_postal_code', { required: true })} />
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Education</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Input label="Last Education" id="last_education" {...register('last_education', { required: true })} />
                        <Input label="University Name" id="university_name" {...register('university_name', { required: true })} />
                        <Input label="Major" id="major" {...register('major', { required: true })} />
                        <Input label="GPA" id="gpa" type="text" {...register('gpa', { required: true })} />
                    </div>
                </section>
                
                <section>
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Job Preference & Others</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Input label="First Choice Position" id="first_choice_position" {...register('first_choice_position')} />
                        <Input label="Second Choice Position" id="second_choice_position" {...register('second_choice_position')} />
                        <Input label="Daily Transportation" id="daily_transportation" {...register('daily_transportation', { required: true })} />
                    </div>
                </section>
                
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isLoading} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                        {isLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;