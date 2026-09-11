const ApiError = require('../../../../utils/api-error');

function normalizeGiaBan(value) {
    const raw = String(value ?? '').trim();
    if (!/^\d+(?:\.\d+)?$/.test(raw)) {
        throw new ApiError(400, 'Giá bán phải là số không âm, dùng dấu chấm thập phân.');
    }
    let [whole, fraction = ''] = raw.split('.');
    whole = whole.replace(/^0+(?=\d)/, '');
    fraction = fraction.replace(/0+$/, '');
    if (whole.length > 12 || fraction.length > 5) {
        throw new ApiError(400, 'Giá bán tối đa 12 số phần nguyên và 5 số thập phân.');
    }
    return fraction ? `${whole}.${fraction}` : whole;
}

module.exports = {
    normalizeGiaBan
};
