const appConfig = require("../config/appConfig");
const ApiError = require("../utils/apiError");

const errorHandler = (err, req, res, next) => {
    let error = err;

    if(!(error instanceof ApiError)) {
        const statusCode = error.statusCode || error.status || 500;
        const message = error.message || 'Something went wrong';
        error = new ApiError(statusCode, message, error?.errors || [], error.stack);
    }

    const response = {
        message: error?.message,
        success: false,
        errors: error?.errors,
        stack: appConfig.nodeEnv !== 'production' ? error.stack : undefined
    };
    res.status(error.statusCode).json(response);
}

const notFoundHandler = (req, res, next) => {
    const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
    next(error);
}

module.exports = {
    errorHandler,
    notFoundHandler
};