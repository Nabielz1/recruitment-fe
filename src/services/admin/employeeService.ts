// src/services/admin/employeeService.ts
import api from '../../api/axiosInstance';
import type { Employee } from '../../types';

interface EmployeesResponse {
    employees: Employee[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export const getAllEmployees = async (page = 1, limit = 10, status = ''): Promise<EmployeesResponse> => {
    const response = await api.get('/admin/employees', { params: { page, limit, status } });
    return response.data.data;
};

export const createEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    const response = await api.post('/admin/employees', employeeData);
    return response.data;
};

export const updateEmployee = async (id: number, employeeData: Partial<Employee>) => {
    const response = await api.put(`/admin/employees/${id}`, employeeData);
    return response.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
    await api.delete(`/admin/employees/${id}`);
};

export const restoreEmployee = async (id: number): Promise<void> => {
    await api.post(`/admin/employees/${id}/restore`);
};

export const getEmployeeStats = async () => {
    const response = await api.get('/admin/employees/stats');
    return response.data.data;
};

export const importEmployees = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/employees/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const exportEmployees = async (): Promise<Blob> => {
    const response = await api.get('/admin/employees/export', { responseType: 'blob' });
    return response.data;
};