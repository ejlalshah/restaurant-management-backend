const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `This action requires ${allowedRoles.join(' or ')} role. You are a ${req.user.role}.`,
      });
    }
    next();
  };
};

module.exports = restrictTo;
