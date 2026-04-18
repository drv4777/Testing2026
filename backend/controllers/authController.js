const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Merchant = require('../models/merchant');

// Register a new user
exports.register = async (req, res) => {
    const { username, password, email, phone, role } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            password: hashedPassword,
            email,
            phone,
            role: role || 'customer',
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Authenticate user & get token
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        user.lastLoginAt = new Date();
        await user.save();

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

// Get current account details for Settings page
exports.getCurrentAccount = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('username email role twoFactorEnabled status createdAt updatedAt');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let merchant = null;
        if (user.role === 'merchant') {
            merchant = await Merchant.findOne({ ownerUserId: user._id })
                .select('_id name apiKey webhookUrl status')
                .lean();
        }

        res.status(200).json({
            user,
            merchant,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch account details' });
    }
};