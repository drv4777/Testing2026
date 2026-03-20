const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Register a new user
exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        // 1. Check if user already exists
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ error: "User already exists" });

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save to MongoDB
        user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Registration failed" });
    }
};

// Authenticate user & get token
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // 1. Find user
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // 3. Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};