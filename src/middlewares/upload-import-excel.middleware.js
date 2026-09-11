const path = require('path');

const multer = require('multer');

const ApiError = require('../utils/api-error');

const DS_DUOI_FILE = ['.xls', '.xlsx', '.xlsm'];

const DS_MIME_TYPE = [
    'application/vnd.ms-excel',

    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

    'application/vnd.ms-excel.sheet.macroenabled.12'
];

const storage = multer.memoryStorage();

function fileFilter(req, file, callback) {
    const duoiFile = path.extname(file.originalname).toLowerCase();

    const hopLeDuoiFile = DS_DUOI_FILE.includes(duoiFile);

    const hopLeMimeType = DS_MIME_TYPE.includes(file.mimetype);

    if (!hopLeDuoiFile || !hopLeMimeType) {
        return callback(new ApiError(400, 'File import không hợp lệ. Chỉ chấp nhận file Excel.'));
    }

    return callback(null, true);
}

const uploadImportExcel = multer({
    storage,

    fileFilter,

    limits: {
        fileSize: 20 * 1024 * 1024,

        files: 1
    }
});

module.exports = uploadImportExcel;
