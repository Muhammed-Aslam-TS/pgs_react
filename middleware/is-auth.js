const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: 401, message: "Not authenticated. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "SECRET");
    req.userId = decodedToken.id;
    req.userRole = decodedToken.role;
    next();
  } catch (err) {
    return res.status(401).json({ status: 401, message: "Invalid or expired token. Please log in again." });
  }
};
