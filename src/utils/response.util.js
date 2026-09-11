const { chuyenDoiNgayGioVietNam } = require('./date-time.util');

function successResponse(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,

        message,

        data: chuyenDoiNgayGioVietNam(data)
    });
}

function errorResponse(res, message, data = null, statusCode = 400) {
    return res.status(statusCode).json({
        success: false,

        message,

        data: chuyenDoiNgayGioVietNam(data)
    });
}

module.exports = {
    successResponse,

    errorResponse
};
