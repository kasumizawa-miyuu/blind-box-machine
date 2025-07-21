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

export const openBox = async (data) => {
    try {
        console.log('发送开盒请求，数据:', data);
        const response = await api.post('/storage/open', data);

        // 验证响应结构
        if (response.status !== 'success') {
            throw new Error(response.message || '开盒操作失败');
        }

        console.log('开盒成功响应:', response);
        return response.data;
    } catch (error) {
        console.error('开盒请求失败:', error);
        throw new Error(error.response?.data?.message || error.message || '开盒失败');
    }
};

export const sellItem = async (data) => {
    try {
        console.log('发送卖出请求，数据:', data);
        const response = await api.post('/storage/sell', data);

        if (response.status !== 'success'){
            throw new Error(response.message || '卖出操作失败');
        }

        console.log('卖出成功响应:', response);
        return response.data;
    } catch (error){
        console.error('卖出请求失败:', error);
        throw new Error(error.response?.data?.message || error.message || '卖出失败');
    }
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