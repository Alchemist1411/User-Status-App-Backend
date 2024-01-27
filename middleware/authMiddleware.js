const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token.' });
    }

    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
};
