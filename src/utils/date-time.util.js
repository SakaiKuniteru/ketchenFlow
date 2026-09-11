function formatDateTimeVietNam(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    /**
     * Việt Nam cố định UTC+7,
     * hiện không sử dụng DST.
     */
    const VIET_NAM_OFFSET_MS = 7 * 60 * 60 * 1000;

    return new Date(date.getTime() + VIET_NAM_OFFSET_MS).toISOString().replace('Z', '+07:00');
}

/**
 * ==================================================
 * Chuyển toàn bộ Date trong object sang giờ Việt Nam
 * ==================================================
 */
function chuyenDoiNgayGioVietNam(data) {
    if (data === null || data === undefined) {
        return data;
    }

    if (data instanceof Date) {
        return formatDateTimeVietNam(data);
    }

    if (Array.isArray(data)) {
        return data.map((item) => chuyenDoiNgayGioVietNam(item));
    }

    if (typeof data === 'object') {
        const result = {};

        for (const [key, value] of Object.entries(data)) {
            result[key] = chuyenDoiNgayGioVietNam(value);
        }

        return result;
    }

    return data;
}

module.exports = {
    formatDateTimeVietNam,

    chuyenDoiNgayGioVietNam
};
