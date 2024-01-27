const { z } = require('zod');
const Community = require('../models/community');
const Member = require('../models/member');
const User = require('../models/user');
const Role = require('../models/role');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const createCommunitySchema = z.object({
    name: z.string().min(2).nullable(false),
});


const create = async (req, res) => {
    try {
        const { name } = createCommunitySchema.parse(req.body);
        const ownerId = req.user.userId;

        const slug = name.toLowerCase().replace(/\s+/g, '-');

        const existingCommunity = await Community.findOne({ slug });
        if (existingCommunity) {
            return res.status(400).json({ error: 'Community with the same name already exists.' });
        }

        const newCommunity = new Community({
            name,
            slug,
            owner: ownerId,
        });

        await newCommunity.save();

        const roleAdmin = await Role.findOne({ name: 'Community Admin' });

        const existingMember = await Member.findOne({
            community: newCommunity.id,
            user: ownerId,
            role: roleAdmin.id,
        });

        if (existingMember) {
            return res.status(400).json({
                status: false,
                errors: [
                    {
                        param: 'user',
                        message: 'User is already a member of the community.',
                        code: 'ALREADY_MEMBER',
                    },
                ],
            });
        }

        const newMember = new Member({
            community: newCommunity.id,
            user: ownerId,
            role: roleAdmin.id,
        });

        await newMember.save();

        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: newCommunity.id,
                    name: newCommunity.name,
                    slug: newCommunity.slug,
                    owner: ownerId,
                    created_at: newCommunity.created_at,
                    updated_at: newCommunity.updated_at,
                },
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            status: false,
            errors: [{
                param: 'name',
                message: 'Name should be at least 2 characters.',
                code: 'INVALID_INPUT',
            },
            ],
        });
    }
};


const getAll = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const perPage = 5;

        // Query communities with pagination
        const communities = await Community.find({});

        // Count total number of communities
        const totalCommunities = await Community.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(totalCommunities / perPage);

        const token = req.headers.authorization.replace('Bearer ', '');
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;

        const user = await User.findOne({ id: userId });


        const formattedCommunity = communities.map(function (community) {
            return {
                id: community.id,
                name: community.name,
                slug: community.slug,
                owner: {
                    id: community.owner,
                    name: user.name,
                },
                created_at: community.created_at,
                updated_at: community.updated_at
            };
        });

        res.status(200).json({
            status: true,
            content: {
                meta: {
                    total: totalCommunities,
                    pages: totalPages,
                    page: page,
                },
                data: formattedCommunity,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Internal Server Error.' });
    }
};


const getAllMembers = async (req, res) => {
    try {
        const communityId = req.params.id;
        const page = req.query.page || 1;
        const perPage = 5;

        // Query members of the community with pagination and expand user and role details
        const members = await Member.find({ community: communityId });

        // Count total number of members in the community
        const totalMembers = await Member.countDocuments({ community: communityId });

        // Calculate total pages
        const totalPages = Math.ceil(totalMembers / perPage);

        // Retrieving user details from the database
        const user = await User.findOne({ user: members.user });

        // Retrieving role details from the database
        const role = await Role.findOne({ role: members.role });

        const formattedMembers = members.map(function (member) {
            return {
                id: member.id,
                community: member.community,
                user: {
                    id: user.id,
                    name: user.name,
                },
                role: {
                    id: role.id,
                    name: role.name,
                },
                created_at: member.created_at,
            };
        });

        res.status(200).json({
            status: true,
            content: {
                meta: {
                    total: totalMembers,
                    pages: totalPages,
                    page: page,
                },
                data: formattedMembers,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Internal Server Error.' });
    }
};


const getMyOwnedCommunity = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const page = req.query.page || 1;
        const perPage = 5;

        // Query communities owned by the current user with pagination
        const communities = await Community.find({ owner: ownerId });

        // Count total number of owned communities
        const totalCommunities = await Community.countDocuments({ owner: ownerId });

        // Calculate total pages
        const totalPages = Math.ceil(totalCommunities / perPage);


        const formatedOwnedCommun = communities.map(function (community) {
            return {
                id: community.id,
                name: community.name,
                slug: community.slug,
                owner: community.owner,
                created_at: community.created_at,
                updated_at: community.updated_at,
            };
        });

        res.status(200).json({
            status: true,
            content: {
                meta: {
                    total: totalCommunities,
                    pages: totalPages,
                    page: page,
                },
                data: formatedOwnedCommun,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
};


const getMyJoinedCommunity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = req.query.page || 1;
        const perPage = 5;

        // Query communities joined by the current user with pagination and expand owner details
        const communities = await Member.find({ user: userId });
        console.log(communities);

        // Count total number of joined communities
        const totalCommunities = await Member.countDocuments({ user: userId });

        // Calculate total pages
        const totalPages = Math.ceil(totalCommunities / perPage);

        // Retrieving user details from the database
        const user = await User.findOne({ user: communities.user });

        // Retrieving community details from the database
        const community = await Community.findOne({ role: communities.role });

        res.status(200).json({
            status: true,
            content: {
                meta: {
                    total: totalCommunities,
                    pages: totalPages,
                    page: page,
                },
                data: [{
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    owner: {
                        id: user.id,
                        name: user.name,
                    },
                    created_at: community.created_at,
                    updated_at: community.updated_at,
                }],
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
};

module.exports = {
    create,
    getAll,
    getAllMembers,
    getMyOwnedCommunity,
    getMyJoinedCommunity,
};