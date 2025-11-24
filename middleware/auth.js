const jwt = require('jsonwebtoken');
const User = require('../model/User');
require('dotenv').config();

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Access denied. Token not found." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    const userData = await User.findById(decoded.id);
    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = userData;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const instructorAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Access denied. Token not found." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    const userData = await User.findById(decoded.id);
    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }
    if (userData.role !== 'instructor') {
    
      return res.status(403).json({ message: "Unauthorized access. Admins only." });
    }

    req.user = userData;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {auth,instructorAuth};
