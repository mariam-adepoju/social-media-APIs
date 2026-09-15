const errorResponse = require("../utils/errorResponse");
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        statusCode = 400;
    }
    console.error(
        `${statusCode} - ${err.message} - ${req.method} ${req.originalUrl}`
    );
    const message =
        statusCode >= 500 && process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message;

    return errorResponse(res, statusCode, message);
};

const notFoundHandler = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = { errorHandler, notFoundHandler };