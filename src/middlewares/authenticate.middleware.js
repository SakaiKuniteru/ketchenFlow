const jwt = require('../utils/jwt');

const ApiError = require('../utils/api-error');

function authenticate(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return next(new ApiError(401, 'Chưa đăng nhập.'));
    }

    const match = authorization.match(/^Bearer\s+(.+)$/i);

    if (!match) {
        return next(new ApiError(401, 'Access Token không hợp lệ.'));
    }

    const accessToken = match[1]?.trim();

    if (!accessToken) {
        return next(new ApiError(401, 'Access Token không hợp lệ.'));
    }

    try {
        const payload = jwt.verifyAccessToken(accessToken);

        if (!payload || !payload.taiKhoanId) {
            return next(new ApiError(401, 'Access Token không hợp lệ.'));
        }

        req.user = {
            ...payload
        };

        return next();
    } catch (error) {
        if (error?.name === 'TokenExpiredError') {
            return next(new ApiError(401, 'Access Token đã hết hạn.'));
        }

        return next(new ApiError(401, 'Access Token không hợp lệ.'));
    }
}

module.exports = authenticate;
