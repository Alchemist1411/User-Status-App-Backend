const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/user');
const { Snowflake } = require('@theinternetfolks/snowflake');
const { JWT_SECRET } = require('../config');

const signupSchema = z.object({
    name: z.string().min(2).nullable(false),
    email: z.string().email().nullable(false),
    password: z.string().min(6).nullable(false),
});

const userController = {
    signup: async (req, res) => {
        try {
            const { name, email, password } = signupSchema.parse(req.body);

            // Check if the email is already registered
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email is already registered.' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generate a new Snowflake ID for the user
            let userId = Snowflake.generate();

            // Create a new user
            const newUser = new User({
                id: userId,
                name,
                email,
                password: hashedPassword,
            });

            // Save the user to the database
            await newUser.save();

            // Generate and send an access token for sign-in
            const token = jwt.sign({ userId }, JWT_SECRET);

            res.status(201).json({
                status: true,
                content: {
                    data: {
                        id: userId,
                        name: newUser.name,
                        email: newUser.email,
                        created_at: newUser.created_at,
                    },
                    meta: {
                        access_token: token,
                    },
                },
            });
        }
        catch (error) {
            console.error(error);
            res.status(400).json({ error: 'Invalid input.' });
        }
    },

    signin: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find the user by email
            const user = await User.findOne({ email });

            // Check if the user exists
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            // Compare the provided password with the hashed password
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }

            // Generate and send a token for authentication
            const token = jwt.sign({ userId: user.id }, JWT_SECRET);

            res.status(200).json({
                status: true,
                content: {
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        created_at: user.created_at,
                    },
                    meta: {
                        access_token: token,
                    },
                },
            });
        }
        catch (error) {
            console.error(error);
            res.status(400).json({ error: 'Invalid input.' });
        }
    },

    getMe: async (req, res) => {
        try {
            // Extract user ID from the token in the Authorization header
            const token = req.headers.authorization.replace('Bearer ', '');
            const decodedToken = jwt.verify(token, JWT_SECRET);
            const userId = decodedToken.userId;

            // Retrieve user details from the database
            const user = await User.findOne({ id: userId });
 
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            res.status(200).json({
                status: true,
                content: {
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        created_at: user.created_at,
                    },
                },
            });
        }
        catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Invalid token.' });
        }
    },
};

module.exports = userController;
