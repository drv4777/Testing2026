const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Import your models (Ensure these files exist in your models folder)
const User = require('../models/user'); 

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        // DEFECT CHECK: README mentions "Insecure password storage"
        // Fix: Hash the password before saving to PostgreSQL/MongoDB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Logic to save user to database goes here
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Logic to find user and compare passwords goes here
        // If successful, generate a JWT [cite: 153]
        const token = jwt.sign({ id: username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};