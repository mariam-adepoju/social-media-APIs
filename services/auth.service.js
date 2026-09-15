const User = require("../models/user.model");
const createError = require("../utils/createError");
const generateToken = require("../utils/generateToken");

const signup = async ({
    first_name,
    last_name,
    username,
    email,
    password,
}) => {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    try {
        const user = await User.create({
            first_name,
            last_name,
            username: normalizedUsername,
            email: normalizedEmail,
            password,
        });

        const token = generateToken(user._id);
        return { user, token };
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            const message = field === "username"
                ? "Username is already taken"
                : "Email is already registered";
            throw createError(message, 409);
        }
        throw err;
    }
};

const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
        email: normalizedEmail,
    }).select("+password");

    if (!user) {
        throw createError("Invalid email or password", 401);
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw createError("Invalid email or password", 401);
    }

    const token = generateToken(user._id);
    return { user, token };
};

module.exports = { signup, login };