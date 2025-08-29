import api from '../api/axiosInstance';
import type { ApplicantProfile } from "../types";

export const getProfile = async (): Promise<ApplicantProfile> => {
    const response = await api.get('/profile');
    return response.data.data;
};

export const createOrUpdateProfile = async (profileData: Partial<ApplicantProfile>) => {
    const response = await api.post('/profile', profileData);
    return response.data;
};