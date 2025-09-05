import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import type { Employee } from '../../types';
import {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    exportEmployees,
    importEmployees
} from '../../services/admin/employeeService';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import "../../styles/App.css";

type EmployeeFormInputs = Omit<Employee, 'id' | 'join_date' | 'status'> & {
    join_date: string; // Ubah tipe data join_date menjadi string untuk input form
    status: 'active' | 'resigned' | 'terminated';
};

const EmployeeManagementPage: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
    const [fileToImport, setFileToImport] = useState<File | null>(null);

    // Hapus 'setValue' dari deklarasi karena 'reset' sudah cukup
    const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeFormInputs>();

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await getAllEmployees();
            setEmployees(data.employees);
        } catch (error) {
            console.error("Failed to fetch employees", error);
            Swal.fire('Error!', 'Failed to load employee data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleOpenModal = (employee?: Employee) => {
        if (employee) {
            setIsEditMode(true);
            setEditingEmployeeId(employee.id);
            reset({
                ...employee,
                join_date: employee.join_date ? new Date(employee.join_date).toISOString().split('T')[0] : '',
            });
        } else {
            setIsEditMode(false);
            setEditingEmployeeId(null);
            reset({
                employee_id: '',
                full_name: '',
                email: '',
                phone: '',
                department: '',
                position: '',
                join_date: '',
                salary: 0,
                address: '',
                status: 'active',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEmployeeId(null);
    };

    const onSubmit: SubmitHandler<EmployeeFormInputs> = async (data) => {
        try {
            const employeeData = {
                employee_id: data.employee_id,
                full_name: data.full_name,
                email: data.email,
                phone: data.phone,
                department: data.department,
                position: data.position,
                join_date: data.join_date, // Nilai dari input date sudah dalam format YYYY-MM-DD
                salary: parseFloat(String(data.salary)), 
                address: data.address,
                status: data.status,
            };

            if (isEditMode && editingEmployeeId) {
                await updateEmployee(editingEmployeeId, employeeData);
                Swal.fire('Success!', 'Employee data updated successfully.', 'success');
            } else {
                await createEmployee(employeeData);
                Swal.fire('Success!', 'New employee added successfully.', 'success');
            }
            handleCloseModal();
            fetchEmployees();
        } catch (error: any) {
            console.error(error);
            Swal.fire('Error!', error.response?.data?.error || 'Failed to save employee data.', 'error');
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You are about to delete this employee. This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteEmployee(id);
                    Swal.fire('Deleted!', 'Employee has been deleted.', 'success');
                    fetchEmployees();
                } catch (error: any) {
                    console.error("Failed to delete employee", error);
                    Swal.fire('Error!', error.response?.data?.error || 'Failed to delete employee.', 'error');
                }
            }
        });
    };
    
    const handleExport = async () => {
        try {
            const blob = await exportEmployees();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'employees_export.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            Swal.fire('Success!', 'Employee data exported successfully.', 'success');
        } catch (error: any) {
            console.error("Failed to export employees", error);
            Swal.fire('Error!', error.response?.data?.error || 'Failed to export data.', 'error');
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFileToImport(event.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!fileToImport) {
            Swal.fire('Warning', 'Please select a CSV file first.', 'warning');
            return;
        }

        try {
            const response = await importEmployees(fileToImport);
            Swal.fire('Success!', `${response.data.success_count} employees imported. ${response.data.error_count} failed.`, 'success');
            setFileToImport(null);
            fetchEmployees();
        } catch (error: any) {
            console.error("Failed to import employees", error);
            Swal.fire('Error!', error.response?.data?.error || 'Failed to import data.', 'error');
        }
    };

    if (loading) {
        return <p className="text-center">Loading employee data...</p>;
    }

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'resigned', label: 'Resigned' },
        { value: 'terminated', label: 'Terminated' },
    ];
    
    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
                <div className="flex space-x-2">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="import-file-input" />
                    <label htmlFor="import-file-input" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer">
                        Choose CSV
                    </label>
                    {fileToImport && (
                        <button onClick={handleImport} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            Import
                        </button>
                    )}
                    <button onClick={handleExport} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                        Export CSV
                    </button>
                    <button onClick={() => handleOpenModal()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Add New Employee
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.length > 0 ? employees.map((employee) => (
                            <tr key={employee.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.employee_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.full_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                        ${employee.status === 'active' ? 'bg-green-100 text-green-800' :
                                         employee.status === 'resigned' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {employee.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-4">
                                        <button onClick={() => handleOpenModal(employee)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No employees found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal untuk Add/Edit Employee */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative p-8 w-full max-w-lg mx-auto bg-white rounded-md shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold">{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input label="Employee ID" id="employee_id" {...register('employee_id', { required: true })} />
                            {errors.employee_id && <span className="text-red-500 text-xs">Employee ID is required</span>}

                            <Input label="Full Name" id="full_name" {...register('full_name', { required: true })} />
                            {errors.full_name && <span className="text-red-500 text-xs">Full Name is required</span>}

                            <Input label="Email" id="email" type="email" {...register('email')} />

                            <Input label="Phone" id="phone" {...register('phone')} />

                            <Input label="Department" id="department" {...register('department', { required: true })} />
                            {errors.department && <span className="text-red-500 text-xs">Department is required</span>}

                            <Input label="Position" id="position" {...register('position', { required: true })} />
                            {errors.position && <span className="text-red-500 text-xs">Position is required</span>}

                            <Input label="Join Date" id="join_date" type="date" {...register('join_date')} />

                            <Input label="Salary" id="salary" type="number" step="0.01" {...register('salary', { required: true, valueAsNumber: true })} />
                            {errors.salary && <span className="text-red-500 text-xs">Salary is required</span>}

                            <Input label="Address" id="address" {...register('address')} />

                            <Select label="Status" id="status" options={statusOptions} {...register('status', { required: true })} />
                            {errors.status && <span className="text-red-500 text-xs">Status is required</span>}

                            <div className="flex justify-end space-x-2 mt-6">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                    {isEditMode ? 'Save Changes' : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagementPage;