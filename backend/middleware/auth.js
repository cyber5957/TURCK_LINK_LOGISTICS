const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.type !== 'access') {
      return res.status(401).json({ message: 'Invalid access token' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const ownerAuth = (req, res, next) => {
  if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
  next();
};

module.exports = { auth, ownerAuth };