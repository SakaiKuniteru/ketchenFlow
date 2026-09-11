const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ApiError = require('../../../../utils/api-error');

const uploadDirectory = path.join(process.cwd(), 'src/public/uploads/temp/co-so');

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.ico'];

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'];

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
        return callback(new ApiError(400, 'File ảnh không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG, WEBP hoặc ICO.'));
    }

    return callback(null, true);
}

const uploadCoSo = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 3
    }
});

module.exports = uploadCoSo;
