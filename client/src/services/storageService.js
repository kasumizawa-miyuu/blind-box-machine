import api from './api';

export const getUserStorage = async (params = {}) => {
    try {
        const response = await api.get('/storage/user', {
            params: {
                search: params.search,
                type: params.type,
                minPrice: params.minAmount,
                maxPrice: params.maxAmount,
                startDate: params.startDate,
                endDate: params.endDate,
                visibility: params.visibilityFilter,
                page: params.page,
                limit: params.limit,
                sort: params.sortField,
                order: params.sortDirection
            }
        });
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
    try {
        const response = await api.patch(`/storage/${itemId}/visibility`);
        return response.data;
    } catch (error) {
        console.error('切换可见性失败:', error);
        throw new Error(error.response?.data?.message || '切换可见性失败');
    }
};

export const getPublicItems = async () => {
    try {
        console.log('正在请求公开物品...');
        const response = await api.get('/storage/public');
        console.log('公开物品响应:', {
            status: response.status,
            data: response.data
        });
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error('获取公开物品失败:', error);
        throw new Error(error.response?.data?.message || '获取公开物品失败');
    }
};