import api from './api';

export const fetchBoxes = async (search = '') => {
    const response = await api.get('/boxes', { params: { search } });
    const data = response.data?.data || response.data;
    if (!Array.isArray(data)) {
        console.error('API返回的数据不是数组:', response);
        return [];
    }

    return data;
};

export const fetchBoxDetail = async (id) => {
    const response = await api.get(`/boxes/${id}`);
    if (!response.data) {
        throw new Error('未获取到武器箱详情');
    }

    return response.data.data || response.data;
};

export const createBox = async (boxData) => {
    const response = await api.post('/boxes', boxData);
    if (!response.data) {
        throw new Error('创建武器箱失败: 服务器返回空响应');
    }

    return response.data.data || response.data;
};

export const updateBox = async (id, boxData) => {
    const response = await api.put(`/boxes/${id}`, boxData);
    if (!response.data) {
        throw new Error('更新武器箱失败: 服务器返回空响应');
    }

    return response.data.data || response.data;
};

export const deleteBox = async (id) => {
    await api.delete(`/boxes/${id}`);
};

export const purchaseBox = async (boxId) => {
    console.log('准备购买武器箱:', boxId);

    try {
        const response = await api.post('/boxes/purchase', { boxId });
        const responseData = response.data?.data || response.data;
        if (!responseData) {
            throw new Error('服务器返回空响应');
        }

        console.log('完整的API响应:', response); // 打印完整响应对象
        return responseData;
    } catch (error) {
        const errorDetails = {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
        };
        console.error('购买请求失败详情:', errorDetails);
        throw errorDetails;
    }
};