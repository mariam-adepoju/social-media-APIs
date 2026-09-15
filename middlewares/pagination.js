const createError = require("../utils/createError");

const pagination = (req, res, next) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    if (!Number.isInteger(page) || page < 1) {
        return next(
            createError("Page must be a positive integer", 400)
        );
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return next(
            createError("Limit must be between 1 and 100", 400)
        );
    }

    req.pagination = { page, limit, };
    next();
};

module.exports = pagination;