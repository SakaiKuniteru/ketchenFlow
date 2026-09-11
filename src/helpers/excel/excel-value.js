function getCellValue(value) {
    if (value === undefined || value === null) {
        return null;
    }

    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    if (typeof value === 'object') {
        if (value.text !== undefined) {
            return String(value.text).trim();
        }

        if (Array.isArray(value.richText)) {
            return value.richText
                .map((item) => item.text)
                .join('')
                .trim();
        }

        if (value.result !== undefined) {
            return value.result;
        }
    }

    if (typeof value === 'string') {
        return value.trim();
    }

    return value;
}

function toNumber(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
}

function toBoolean(value, defaultValue = true) {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    const normalized = String(value).trim().toLowerCase();

    if (['true', '1', 'x', 'có', 'co'].includes(normalized)) {
        return true;
    }

    if (['false', '0', 'không', 'khong'].includes(normalized)) {
        return false;
    }

    throw new Error('Trạng thái không hợp lệ.');
}

module.exports = {
    getCellValue,

    toNumber,

    toBoolean
};
