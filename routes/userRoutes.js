const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User sign-up
router.post('/signup', userController.signup);

// User sign-in
router.post('/signin', userController.signin);

// Get currently signed-in user
router.get('/me', userController.getMe);

module.exports = router;