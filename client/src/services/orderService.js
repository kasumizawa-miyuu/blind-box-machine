import api from './api';

export const getUserOrders = async (params = {}) => {
    try {
        const response = await api.get('/orders/user', {
            params: {
                page: 1,
                limit: 10,
                ...params
            }
        });

        console.log('订单完整API响应:', response);

        // 根据实际响应结构调整数据提取方式
        return Array.isArray(response) ? response :
            Array.isArray(response?.data) ? response.data :
                Array.isArray(response?.data?.data) ? response.data.data : [];
    } catch (error) {
        console.error('获取订单失败:', error);
        throw error;
    }
};