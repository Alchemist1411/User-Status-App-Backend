const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

// Create a new role
router.post('/', roleController.create);

// Get all roles with pagination
router.get('/', roleController.getAll);

module.exports = router;