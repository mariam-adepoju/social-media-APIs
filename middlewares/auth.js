const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const createError = require("../utils/createError");

const authenticate = async (req, res, next) => {
    try {
        // 1. Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw createError(
                "Authentication required. No token provided.",
                401
            );
        }

        // 2. Extract token
        const token = authHeader.split(" ")[1];
        if (!token) {
            throw createError("Invalid authorization header", 401);
        }

        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find authenticated user
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw createError("User associated with this token no longer exists", 401);
        }

        // 5. Attach user to request
        req.user = user;

        // 6. Continue
        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(
                createError("Authentication token has expired", 401)
            );
        }

        if (error.name === "JsonWebTokenError") {
            return next(
                createError("Invalid authentication token", 401)
            );
        }
        next(error);
    }
};

module.exports = authenticate;