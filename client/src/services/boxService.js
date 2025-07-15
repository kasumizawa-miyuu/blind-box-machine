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
    const response = await api.post('/orders/purchase', { boxId });
    return response;
};