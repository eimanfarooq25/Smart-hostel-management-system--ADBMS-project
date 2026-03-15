const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please login first'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Insufficient permissions for this operation',
        required_roles: allowedRoles,
        your_role: req.user.role
      });
    }
    
    next();
  };
};

module.exports = { checkRole };