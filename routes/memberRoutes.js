const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const {authenticateToken} = require('../middleware/authMiddleware');

// Add a member to the community
router.post('/', authenticateToken, memberController.addMember);

// DELETE /v1/member/:id
router.delete('/:id', authenticateToken, memberController.removeMember);

module.exports = router;
