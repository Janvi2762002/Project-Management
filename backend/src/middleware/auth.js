import jwt from "jsonwebtoken";

export default (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token provided
    if (!authHeader) {
      return res.status(401).json({
        message: "No token, access denied"
      });
    }

    // Expecting: "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid token format"
      });
    }

    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = verified;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};