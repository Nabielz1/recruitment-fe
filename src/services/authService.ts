import api from '../api/axiosInstance';
import type { LoginResponse, UserCredentials, UserRegister } from "../types";

export const loginUser = async (credentials: UserCredentials): Promise<LoginResponse> => {
  const response = await api.post('/login', credentials);
  if (response.data.data.token) {
    localStorage.setItem('authToken', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  return response.data.data;
};

export const registerUser = async (userData: UserRegister) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};