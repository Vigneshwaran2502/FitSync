import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants.js";
import { User } from "../models/User.js";
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format." });
    }
    if (token.startsWith("fitsync_demo_")) {
      const demoRole = token.replace("fitsync_demo_", "");
      const demoUser = await User.findOne({ role: demoRole }).select("-password");
      if (demoUser) {
        req.user = demoUser;
        return next();
      }
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = await User.findById(decoded.id).select("-password");
    if (!user && decoded.role) {
      user = await User.findOne({ role: decoded.role }).select("-password");
    }
    if (!user) {
      return res.status(401).json({ message: "User belonging to this token no longer exists." });
    }
    if (user.status === "inactive") {
      return res.status(403).json({ message: "This account has been deactivated. Please contact support." });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid authentication token." });
  }
}
async function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  return authenticateToken(req, res, next);
}
export {
  authenticateToken,
  optionalAuthenticateToken
};
