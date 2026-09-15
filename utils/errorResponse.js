const errorResponse = (
    res,
    statusCode,
    message,
    data = null
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data,
    });
};

module.exports = errorResponse;