import api from '../api/axiosInstance';
import type { JobApplication } from "../types";

interface AdminApplicationsResponse {
    applications: JobApplication[];
    total: number;
    page: number;
    limit: number;
}

export const getAdminApplications = async (page = 1, limit = 10, status = ''): Promise<AdminApplicationsResponse> => {
    const response = await api.get('/admin/applications', {
        params: { page, limit, status }
    });
    return response.data.data;
};

export const updateApplicationStatus = async (id: number, status: 'accepted' | 'rejected', notes: string = '') => {
    const response = await api.put(`/admin/applications/${id}/status`, {
        status,
        notes,
    });
    return response.data;
};