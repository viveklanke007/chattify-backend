const jwt = require("jsonwebtoken");
require("dotenv").config();

function auth(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to req
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);

    // If token expired / invalid → clear browser cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = auth;
