const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
// No need for a fatal error here as it's checked in authController or server startup.
// If JWT_SECRET is not set, jwt.verify will throw an error handled below.

module.exports = function(req, res, next) {
  console.log(`🔐 Auth middleware called for ${req.method} ${req.originalUrl}`);

  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if not token
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Token is typically in the format "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token is not valid (must be Bearer token)' });
  }

  const token = parts[1];

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload to request object
    // The payload was structured as { user: { id: ..., email: ... } } when signing
    req.user = decoded.user; 
    next(); // Call next middleware or route handler
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
