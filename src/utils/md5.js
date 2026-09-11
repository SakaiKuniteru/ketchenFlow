const md5 = require('md5');

function hash(password) {
    return md5(password);
}

function compare(password, hashPassword) {
    return md5(password) === hashPassword;
}

module.exports = {
    hash,

    compare
};
