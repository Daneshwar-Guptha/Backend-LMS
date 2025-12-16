const jwt = require("jsonwebtoken");
const User = require("../model/User");

require("dotenv").config();

// ----------------------- AUTH (All Users) -----------------------
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    

    if (!token)
      return res.status(401).json({ message: "Access denied. Token missing." });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found." });

    req.user = user;
  
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------- INSTRUCTOR AUTH -----------------------
const instructorAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token)
      return res.status(401).json({ message: "Access denied. Token missing." });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found." });

    if (user.role !== "instructor")
      return res.status(403).json({ message: "Only instructors can access this route." });

    req.user = user;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------- ADMIN AUTH -----------------------
const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token)
      return res.status(401).json({ message: "Access denied. Token missing." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found." });

    if (user.role !== "admin")
      return res.status(403).json({ message: "Admins only." });

    req.user = user;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------- ROLE BASED (Flexible Middleware) -----------------------
// const RoleBased = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role))
//       return res.status(403).json({ message: "You do not have permission." });

//     next();
//   };
// };

module.exports = { auth, instructorAuth, adminAuth };
