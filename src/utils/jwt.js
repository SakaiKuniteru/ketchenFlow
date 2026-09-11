const jwt = require('jsonwebtoken');

function generateAccessToken(payload, expiresInMinutes) {
    const expiresIn =
        Number.isFinite(Number(expiresInMinutes)) && Number(expiresInMinutes) > 0
            ? `${Number(expiresInMinutes)}m`
            : process.env.ACCESS_TOKEN_EXPIRES;

    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn
    });
}

function generateRefreshToken(payload, expiresInMinutes) {
    const expiresIn =
        Number.isFinite(Number(expiresInMinutes)) && Number(expiresInMinutes) > 0
            ? `${Number(expiresInMinutes)}m`
            : process.env.REFRESH_TOKEN_EXPIRES;

    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn
    });
}

function verifyAccessToken(token) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

module.exports = {
    generateAccessToken,

    generateRefreshToken,

    verifyAccessToken,

    verifyRefreshToken
};
