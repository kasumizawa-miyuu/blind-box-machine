import api from './api';

export const fetchBoxes = async (search = '') => {
    const response = await api.get('/boxes', { params: { search } });
    return response;
};

export const fetchBoxDetail = async (id) => {
    const response = await api.get(`/boxes/${id}`);
    return response;
};

export const createBox = async (boxData) => {
    const response = await api.post('/boxes', boxData);
    return response;
};

export const updateBox = async (id, boxData) => {
    const response = await api.put(`/boxes/${id}`, boxData);
    return response;
};

export const deleteBox = async (id) => {
    await api.delete(`/boxes/${id}`);
};

export const purchaseBox = async (boxId) => {
    console.log('准备购买盲盒:', boxId);

    try {
        const response = await api.post('/orders/purchase', { boxId });
        const responseData = response.data?.data || response.data;
        if (!responseData) {
            throw new Error('服务器返回空响应');
        }

        console.log('完整的API响应:', response); // 打印完整响应对象
        return response.data;
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