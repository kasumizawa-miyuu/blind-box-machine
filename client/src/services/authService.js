import api from './api';

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data.data || response.data;
};

export const register = async (credentials) => {
    await api.post('/auth/register', credentials);
};

export const registerAdmin = async (credentials) => {
    await api.post('/auth/register-admin', credentials);
};