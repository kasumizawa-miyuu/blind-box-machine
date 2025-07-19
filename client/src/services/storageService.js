import api from './api';

export const getUserStorage = async () => {
    try {
        const response = await api.get('/storage/user');

        console.log('仓库API响应数据:', response.data);

        return Array.isArray(response) ? response :
            Array.isArray(response?.data) ? response.data :
                Array.isArray(response?.data?.data) ? response.data.data : [];
    } catch (error) {
        console.error('加载仓库失败:', error);
        throw error;
    }
};

export const openBox = async (boxId) => {
    const response = await api.post(`/storage/${boxId}/open`);
    return response;
};

export const sellItem = async (itemId) => {
    const response = await api.post(`/storage/${itemId}/sell`);
    return response;
};

export const toggleItemVisibility = async (itemId) => {
    const response = await api.patch(`/storage/${itemId}/visibility`);
    return response;
};

export const getPublicItems = async (userId = null) => {
    const params = userId ? { userId } : {};
    const response = await api.get('/storage/public', { params });
    return Array.isArray(response.data) ? response.data : [];
};