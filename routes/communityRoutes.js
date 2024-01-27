const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Create a new community
router.post('/', authenticateToken, communityController.create);

// Get all communities with pagination
router.get('/', authenticateToken, communityController.getAll);

// Get all members of a community with pagination
router.get('/:id/members', authenticateToken, communityController.getAllMembers);

// Get communities owned by the current user with pagination
router.get('/me/owner', authenticateToken, communityController.getMyOwnedCommunity);

// Get communities joined by the current user with pagination
router.get('/me/member', authenticateToken, communityController.getMyJoinedCommunity);


module.exports = router;