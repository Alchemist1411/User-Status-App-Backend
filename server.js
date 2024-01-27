const express = require('express');
const { connectDB } = require('./db');
const authRoutes = require('./routes/userRoutes');
const communityRoutes = require('./routes/communityRoutes');
const memberRoutes = require('./routes/memberRoutes');
const roleRoutes = require('./routes/roleRoutes');

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());

const PORT = process.env.PORT || 3000;


app.use('/v1/auth', authRoutes);
app.use('/v1/community', communityRoutes);
app.use('/v1/member', memberRoutes);
app.use('/v1/role', roleRoutes);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
