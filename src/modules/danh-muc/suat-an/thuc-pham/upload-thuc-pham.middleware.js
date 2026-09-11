'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const tempDirectory = path.join(process.cwd(), 'src', 'public', 'uploads', 'temp', 'thuc-pham');

if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory, {
        recursive: true
    });
}

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, tempDirectory);
    },

    filename(req, file, callback) {
        const extension = path.extname(file.originalname).toLowerCase();

        const fileName = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`;

        callback(null, fileName);
    }
});

const fileFilter = (req, file, callback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
        return callback(new Error('Chỉ hỗ trợ ảnh JPG, JPEG, PNG hoặc WEBP.'));
    }

    callback(null, true);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});
