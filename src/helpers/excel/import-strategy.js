'use strict';

const ApiError = require('../../utils/api-error');

function normalizeCode(value) {
    if (value === undefined || value === null) {
        return null;
    }

    return String(value).trim().toUpperCase();
}

function validateKeyHeaders(headerMap, options) {
    const { idKey = 'id/k', codeKey, codeField } = options;

    const hasIdKey = headerMap.has(idKey);

    const hasCodeKey = headerMap.has(codeKey);

    const hasCodeNormal = headerMap.has(codeField);

    if (!hasCodeKey && !hasCodeNormal) {
        throw new ApiError(400, `File import phải có field "${codeField}" hoặc "${codeKey}".`);
    }

    if (hasCodeKey && hasCodeNormal) {
        throw new ApiError(400, `File import không được đồng thời có "${codeField}" và "${codeKey}".`);
    }

    return {
        idKey,

        codeKey,

        codeField,

        hasIdKey,

        hasCodeKey,

        hasCodeNormal
    };
}

async function resolveImportStrategy(item, options) {
    const { getById, getByCode, getRecordId = (record) => record.id, getRecordCode, entityName = 'bản ghi' } = options;

    const hasId = item.id !== undefined;

    const hasCode = item.code !== undefined;

    if (item.idIsKey && item.codeIsKey) {
        if (hasId && hasCode) {
            const byId = await getById(Number(item.id));

            if (!byId) {
                throw new ApiError(404, `Không tìm thấy ${entityName} có ID ${item.id}.`);
            }

            const byCode = await getByCode(item.code);

            if (!byCode) {
                throw new ApiError(404, `Không tìm thấy ${entityName} có mã "${item.code}".`);
            }

            if (Number(getRecordId(byId)) !== Number(getRecordId(byCode))) {
                throw new ApiError(400, `ID ${item.id} và mã "${item.code}" không cùng một ${entityName}.`);
            }

            return {
                action: 'UPDATE',

                record: byId,

                allowCodeChange: false
            };
        }

        if (hasId) {
            const byId = await getById(Number(item.id));

            if (!byId) {
                throw new ApiError(404, `Không tìm thấy ${entityName} có ID ${item.id}.`);
            }

            return {
                action: 'UPDATE',

                record: byId,

                allowCodeChange: false
            };
        }

        if (hasCode) {
            const byCode = await getByCode(item.code);

            if (byCode) {
                return {
                    action: 'UPDATE',

                    record: byCode,

                    allowCodeChange: false
                };
            }

            return {
                action: 'CREATE',

                record: null,

                allowCodeChange: false
            };
        }

        throw new ApiError(400, `Phải nhập ID hoặc mã ${entityName}.`);
    }

    if (item.idIsKey && !item.codeIsKey) {
        if (hasId) {
            const byId = await getById(Number(item.id));

            if (!byId) {
                throw new ApiError(404, `Không tìm thấy ${entityName} có ID ${item.id}.`);
            }

            if (hasCode) {
                const byCode = await getByCode(item.code);

                if (byCode && Number(getRecordId(byCode)) !== Number(getRecordId(byId))) {
                    throw new ApiError(409, `Mã "${item.code}" đã tồn tại ở ${entityName} khác.`);
                }
            }

            return {
                action: 'UPDATE',

                record: byId,

                allowCodeChange: true
            };
        }

        if (!hasCode) {
            throw new ApiError(400, `Thêm mới ${entityName} phải có mã.`);
        }

        const byCode = await getByCode(item.code);

        if (byCode) {
            throw new ApiError(409, `Mã "${item.code}" đã tồn tại.`);
        }

        return {
            action: 'CREATE',

            record: null,

            allowCodeChange: true
        };
    }

    if (!item.idIsKey && item.codeIsKey) {
        if (!hasCode) {
            throw new ApiError(400, `Mã ${entityName} không được để trống.`);
        }

        const byCode = await getByCode(item.code);

        if (byCode) {
            return {
                action: 'UPDATE',

                record: byCode,

                allowCodeChange: false
            };
        }

        return {
            action: 'CREATE',

            record: null,

            allowCodeChange: false
        };
    }

    if (!hasCode) {
        throw new ApiError(400, `Mã ${entityName} không được để trống.`);
    }

    const byCode = await getByCode(item.code);

    if (byCode) {
        throw new ApiError(409, `Mã "${item.code}" đã tồn tại.`);
    }

    return {
        action: 'CREATE',

        record: null,

        allowCodeChange: true
    };
}

function shouldChangeCode(newCode, currentCode) {
    if (newCode === undefined) {
        return false;
    }

    return normalizeCode(newCode) !== normalizeCode(currentCode);
}

module.exports = {
    validateKeyHeaders,

    resolveImportStrategy,

    shouldChangeCode
};
