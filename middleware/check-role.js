module.exports = (roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ status: 401, message: "Unauthorized" });
    }
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        status: 403,
        message: "You don't have permission to perform this action",
      });
    }
    next();
  };
};
