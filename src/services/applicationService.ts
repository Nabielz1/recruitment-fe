import api from '../api/axiosInstance';
import type { JobApplication } from "../types";

export const submitApplication = async (): Promise<{ application_id: number; status: string }> => {
    const response = await api.post('/application/submit');
    return response.data.data;
};

export const getUserApplications = async (): Promise<JobApplication[]> => {
    const response = await api.get('/applications');
    return response.data.data;
};