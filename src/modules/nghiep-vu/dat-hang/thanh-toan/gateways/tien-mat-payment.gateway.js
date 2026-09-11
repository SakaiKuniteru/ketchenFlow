'use strict';
const crypto = require('crypto');
module.exports = {
    create: async () => ({
        maGiaoDich: `TM-${crypto.randomUUID()}`,
        choXuLy: true
    })
};
