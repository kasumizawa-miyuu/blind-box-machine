import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 响应拦截器 - 处理错误
api.interceptors.response.use((response) => {
    return response.data;
}, (error) => {
    if (error.response?.status === 401) {
        // 认证失败，跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
    }
    return Promise.reject(error.response?.data?.error || '请求失败');
});

export default api;