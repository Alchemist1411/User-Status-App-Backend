const mongoose = require('mongoose');
const User = require('./models/user');
const Community = require('./models/community');
const Role = require('./models/role');
const Member = require('./models/member');

const connectDB = async () => {
    try {
        // It's a test database, feel free to use it
        await mongoose.connect('mongodb+srv://deepak:theinternetfolks123@testnetwork.x6rhkzb.mongodb.net/tif_db');
        console.log('MongoDB connected');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = {
    User,
    Community,
    Role,
    Member,
    connectDB,
};
