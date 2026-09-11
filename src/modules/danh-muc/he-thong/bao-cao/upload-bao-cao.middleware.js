const fs = require('fs');

const path = require('path');

const multer = require('multer');

const ApiError = require('../../../../utils/api-error');

const uploadDirectory = path.join(process.cwd(), 'src/public/uploads/danh-muc/bao-cao');

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}

const WORD_EXTENSIONS = ['.doc', '.docx'];

const EXCEL_EXTENSIONS = ['.xls', '.xlsx', '.xlsm', '.xlsb'];

const WORD_MIME_TYPES = [
    'application/msword',

    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const EXCEL_MIME_TYPES = [
    'application/vnd.ms-excel',

    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

    'application/vnd.ms-excel.sheet.macroenabled.12',

    'application/vnd.ms-excel.sheet.binary.macroenabled.12'
];

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, uploadDirectory);
    },

    filename(req, file, callback) {
        const extension = path.extname(file.originalname).toLowerCase();

        const baseName = path
            .basename(file.originalname, extension)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        let fileName = `${baseName}${extension}`;

        let index = 1;

        while (fs.existsSync(path.join(uploadDirectory, fileName))) {
            fileName = `${baseName}-${index}${extension}`;

            index++;
        }

        callback(null, fileName);
    }
});

function fileFilter(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();

    const extensionHopLe = WORD_EXTENSIONS.includes(extension) || EXCEL_EXTENSIONS.includes(extension);

    const mimeTypeHopLe = WORD_MIME_TYPES.includes(file.mimetype) || EXCEL_MIME_TYPES.includes(file.mimetype);

    if (!extensionHopLe || !mimeTypeHopLe) {
        return callback(new ApiError(400, 'File mẫu không hợp lệ. Chỉ chấp nhận file Word hoặc Excel.'));
    }

    callback(null, true);
}

const uploadBaoCao = multer({
    storage,

    fileFilter,

    limits: {
        fileSize: 20 * 1024 * 1024,

        files: 1
    }
});

module.exports = uploadBaoCao;
