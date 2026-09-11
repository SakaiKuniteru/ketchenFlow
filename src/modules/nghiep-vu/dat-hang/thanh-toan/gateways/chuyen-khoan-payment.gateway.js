'use strict';
const crypto = require('crypto');
module.exports = {
    create: async () => ({
        maGiaoDich: `CK-${crypto.randomUUID()}`,
        choXuLy: true
    })
};
