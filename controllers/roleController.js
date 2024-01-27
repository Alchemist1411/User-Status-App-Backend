const { z } = require('zod');
const Role = require('../models/role');

const createRoleSchema = z.object({
    name: z.string().min(2).nullable(false),
});

const roleController = {
    create: async (req, res) => {
        try {
            const { name } = createRoleSchema.parse(req.body);

            // Check if the role name already exists
            const existingRole = await Role.findOne({ name });
            if (existingRole) {
                return res.status(400).json({ error: 'Role already exists.' });
            }

            // Create a new role
            const newRole = new Role({
                name,
            });

            // Save the role to the database
            await newRole.save();

            res.status(201).json({
                status: true,
                content: {
                    data: {
                        id: newRole.id,
                        name: name,
                        created_at: newRole.created_at,
                        updated_at: newRole.updated_at
                    }
                }
            });
        }
        catch (error) {
            console.error(error);
            res.status(400).json({
                status: false,
                errors: [
                    {
                        param: "name",
                        message: "Name should be at least 2 characters.",
                        code: "INVALID_INPUT"
                    }
                ]
            });
        }
    },

    getAll: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const perPage = 5;

            // Get total number of roles
            const totalRoles = await Role.countDocuments();

            // Calculate total number of pages
            const totalPages = Math.ceil(totalRoles / perPage);

            // Ensure the requested page is within the valid range
            if (page < 1 || page > totalPages) {
                return res.status(400).json({ error: 'Invalid page number.' });
            }

            // Get roles for the requested page
            const roles = await Role.find()
                .skip((page - 1) * perPage)
                .limit(perPage)
                .select({ __v: 0 }); // Exclude the version key


            const formattedRoles = roles.map(function (role) {
                return {
                    id: role.id,
                    name: role.name,
                    created_at: role.created_at,
                    updated_at: role.updated_at,
                };
            });

            console.log(roles);
            res.status(200).json({
                status: true,
                content: {
                    meta: {
                        total: totalRoles,
                        pages: totalPages,
                        page,
                    },
                    data: formattedRoles,
                },
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    },
};


module.exports = roleController;