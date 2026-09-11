module.exports = (
    error,

    req,

    res,

    next
) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(error);
    }

    const statusCode = error.statusCode || 500;

    const response = {
        success: false,

        message: error.message || 'Đã xảy ra lỗi trong quá trình xử lý.',

        data: null
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
    }

    return res.status(statusCode).json(response);
};
