import api from './api';

/**
 * 获取用户订单列表
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.limit=10] - 每页数量
 * @param {string} [params.type] - 订单类型(purchase/sell)
 * @returns {Promise<Array>} 订单数组
 */
export const getUserOrders = async (params = {}) => {
    const response = await api.get('/orders', {
        params: {
            page: 1,
            limit: 10,
            ...params
        }
    });
    return response;
};

/**
 * 出售物品
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} 包含更新后的余额
 */
export const sellItem = async (orderId) => {
    const response = await api.post(`/orders/${orderId}/sell`);
    return response;
};

/**
 * 获取订单详情
 * @param {string} orderId - 订单ID
 * @returns {Promise<Object>} 订单详情
 */
export const getOrderDetail = async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response;
};

/**
 * 获取用户交易历史
 * @param {Object} [params] - 查询参数
 * @param {string} [params.startDate] - 开始日期(YYYY-MM-DD)
 * @param {string} [params.endDate] - 结束日期(YYYY-MM-DD)
 * @returns {Promise<Array>} 交易历史数组
 */
export const getTransactionHistory = async (params = {}) => {
    const response = await api.get('/orders/history', { params });
    return response;
};

/**
 * 批量出售物品
 * @param {Array<string>} orderIds - 订单ID数组
 * @returns {Promise<Object>} 包含更新后的余额
 */
export const batchSellItems = async (orderIds) => {
    const response = await api.post('/orders/batch-sell', { orderIds });
    return response;
};

/**
 * 获取用户收藏物品
 * @returns {Promise<Array>} 收藏物品数组
 */
export const getWishlist = async () => {
    const response = await api.get('/orders/wishlist');
    return response;
};

/**
 * 添加物品到收藏
 * @param {string} orderId - 订单ID
 * @returns {Promise<void>}
 */
export const addToWishlist = async (orderId) => {
    await api.post(`/orders/${orderId}/wishlist`);
};

/**
 * 从收藏移除物品
 * @param {string} orderId - 订单ID
 * @returns {Promise<void>}
 */
export const removeFromWishlist = async (orderId) => {
    await api.delete(`/orders/${orderId}/wishlist`);
};