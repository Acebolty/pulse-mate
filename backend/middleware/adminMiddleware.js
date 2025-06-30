const User = require('../models/User');

/**
 * Admin authorization middleware
 * Checks if the authenticated user has admin privileges
 * Must be used after authMiddleware
 */
module.exports = async function(req, res, next) {
  try {
    // req.user should be set by authMiddleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: 'Access denied. Authentication required.' 
      });
    }

    // Get user from database to check role
    const user = await User.findById(req.user.id).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Access denied. User not found.' 
      });
    }

    // Check if user has admin role
    // For now, we'll check if the user email is admin@pulsemate.com
    // Later, you can add a role field to the User model
    const isAdmin = user.email === 'admin@pulsemate.com' || user.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Add full user object to request for use in controllers
    req.adminUser = user;
    next();
    
  } catch (error) {
    console.error('Admin middleware error:', error.message);
    res.status(500).json({ 
      message: 'Server error during authorization check.' 
    });
  }
};
