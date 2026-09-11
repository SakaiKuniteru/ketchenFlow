'use strict';

function normalizeMultipartBody(body) {
    const result = {
        ...(body || {})
    };

    const numberFields = ['quocGiaId', 'tinhThanhId', 'xaPhuongId'];

    for (const field of numberFields) {
        if (result[field] === '') {
            result[field] = null;
            continue;
        }

        if (result[field] !== undefined && result[field] !== null) {
            result[field] = Number(result[field]);
        }
    }

    if (result.active !== undefined) {
        const activeValue = String(result.active).trim().toLowerCase();

        if (activeValue === 'true') {
            result.active = true;
        } else if (activeValue === 'false') {
            result.active = false;
        }
    }

    return result;
}

function mapCoSoUpload(req, res, next) {
    req.body = normalizeMultipartBody(req.body);

    console.log(req.body);
    console.log(req.files);

    next();
}

module.exports = mapCoSoUpload;
