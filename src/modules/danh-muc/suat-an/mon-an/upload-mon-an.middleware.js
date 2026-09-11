'use strict';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ApiError = require('../../../../utils/api-error');

const uploadDirectory = path.join(process.cwd(), 'src/public/uploads/temp/mon-an');

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, uploadDirectory);
    },

    filename(req, file, callback) {
        const extension = path.extname(file.originalname).toLowerCase();

        const fileName = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`;

        callback(null, fileName);
    }
});

function fileFilter(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!IMAGE_EXTENSIONS.includes(extension) || !IMAGE_MIME_TYPES.includes(file.mimetype)) {
        return callback(new ApiError(400, 'Hình ảnh món ăn chỉ hỗ trợ JPG, JPEG, PNG hoặc WEBP.'));
    }

    return callback(null, true);
}

const uploadMonAn = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

module.exports = uploadMonAn;
