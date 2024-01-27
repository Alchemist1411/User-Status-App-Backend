const Member = require('../models/member');
const Role = require('../models/role');
const Community = require('../models/community');
const User = require('../models/user');

// Helper function to check if a user has a specific role
const hasRole = async (userId, roleName) => {
    const role = await Role.findOne({ name: roleName });
    if (!role) {
        return false;
    }

    const user = await User.findById(userId);
    return user && user.roles.includes(role.id);
};

const addMember = async (req, res) => {
    try {
        const { community: communityId, user: userId, role: roleId } = req.body;

        // Check if the user has the role of Community Admin
        const isAdmin = await hasRole(userId, 'Community Admin');
        if (!isAdmin) {
            return res.status(403).json({ status: false, error: 'NOT_ALLOWED_ACCESS' });
        }

        // Check if the community, user, and role exist
        const community = await Community.findById(communityId);
        const user = await User.findById(userId);
        const role = await Role.findById(roleId);

        if (!community || !user || !role) {
            return res.status(404).json({ status: false, error: 'RESOURCE_NOT_FOUND' });
        }

        // Create a new member
        const newMember = new Member({
            community: communityId,
            user: userId,
            role: roleId,
        });

        // Save the member to the database
        await newMember.save();

        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: newMember.id,
                    community: communityId,
                    user: userId,
                    role: roleId,
                    created_at: newMember.created_at,
                },
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal Server Error' });
    }
};


const removeMember = async (req, res) => {
    try {
        const memberId = req.params.id;
        const currentUserId = req.user.userId;

        // Check if the current user is a Community Admin or Community Moderator
        const roleAdmin = await Role.findOne({ name: 'Community Admin' });
        const roleModerator = await Role.findOne({ name: 'Community Moderator' });

        const isAdminOrModerator = await Member.exists({
            id: memberId,
            $or: [
                { user: currentUserId, role: roleAdmin ? roleAdmin.id : null },
                { user: currentUserId, role: roleModerator ? roleModerator.id : null },
            ],
        });

        if (!isAdminOrModerator) {
            return res.status(403).json({
                "status": false,
                "errors": [
                    {
                        "message": "Member not found.",
                        "code": "RESOURCE_NOT_FOUND"
                    }
                ]
            });
        }

        // Remove the member from the community
        await Member.deleteOne({ id: memberId });

        res.status(200).json({
            status: true,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
};


module.exports = {
    addMember,
    hasRole,
    removeMember,
};
