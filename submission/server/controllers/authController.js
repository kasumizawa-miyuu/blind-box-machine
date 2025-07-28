const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.registerAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password, role: 'admin' });
        await user.save();
        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        console.log('Found user:', user);

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('Login response:', {
            token,
            role: user.role,
            balance: user.balance,
            user: user.username
        });

        res.json({
            token,
            role: user.role,
            balance: user.balance,
            user: user.username
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};