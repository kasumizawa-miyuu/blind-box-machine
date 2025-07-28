const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (requiredRole) => async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error('Authentication required');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) throw new Error('User not found');
        if (requiredRole && user.role !== requiredRole) {
            throw new Error('Insufficient permissions');
        }

        req.user = { userId: user._id, role: user.role };
        next();
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};