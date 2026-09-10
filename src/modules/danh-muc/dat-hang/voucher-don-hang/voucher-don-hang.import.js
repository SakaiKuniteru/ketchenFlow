"use strict";

const ApiError =
    require("../../../../utils/api-error");

const {
    readExcel
} = require(
    "../../../../helpers/excel/excel-reader"
);

const {
    toNumber,
    toBoolean
} = require(
    "../../../../helpers/excel/excel-value"
);

const {
    validateKeyHeaders,
    resolveImportStrategy,
    shouldChangeCode
} = require(
    "../../../../helpers/excel/import-strategy"
);

const {
    createResultFile
} = require(
    "../../../../helpers/excel/excel-result"
);

const voucherDonHangRepository =
    require("./voucher-don-hang.repository");

const voucherDonHangService =
    require("./voucher-don-hang.service");

const {
    MA_BAO_CAO,
    HEADER_ROW,
    DATA_START_ROW
} = require("./voucher-don-hang.export");

const numberFields = {
    loaiGiam: "Loại giảm",
    giaTri: "Giá trị giảm",
    giamToiDa: "Giảm tối đa",
    giaTriDonHangToiThieu:
        "Giá trị đơn hàng tối thiểu",
    soLuongPhatHanh:
        "Số lượng phát hành",
    soLuotMoiNhanVien:
        "Số lượt mỗi nhân viên",
    phamViApDung:
        "Phạm vi áp dụng"
};

const integerFields = new Set([
    "loaiGiam",
    "soLuongPhatHanh",
    "soLuotMoiNhanVien",
    "phamViApDung"
]);

const booleanFields = [
    "choPhepDungChung",
    "tuDongApDung",
    "active"
];

const relationFields = [
    "nhomSanPhamIds",
    "sanPhamIds",
    "coSoIds",
    "phongBanIds",
    "chucVuIds",
    "nhanVienIds"
];

function parsePositiveInteger(
    value,
    fieldName
) {
    const number =
        toNumber(value);

    if (
        number === null ||
        !Number.isInteger(number) ||
        number <= 0
    ) {
        throw new ApiError(
            400,
            `${fieldName} phải là số nguyên lớn hơn 0.`
        );
    }

    return number;
}

function parseNumberField(
    value,
    fieldName,
    integer = false
) {
    if (value === undefined) {
        return undefined;
    }

    const number =
        toNumber(value);

    if (
        number === null ||
        Number.isNaN(number)
    ) {
        throw new ApiError(
            400,
            `${fieldName} phải là số.`
        );
    }

    if (
        integer &&
        !Number.isInteger(number)
    ) {
        throw new ApiError(
            400,
            `${fieldName} phải là số nguyên.`
        );
    }

    return number;
}

function parseBooleanField(
    value,
    fieldName
) {
    if (value === undefined) {
        return undefined;
    }

    try {
        return toBoolean(value);
    } catch (error) {
        throw new ApiError(
            400,
            `${fieldName} không hợp lệ.`
        );
    }
}

function parseIdList(
    value,
    fieldName
) {
    if (value === undefined) {
        return undefined;
    }

    if (
        value === null ||
        String(value).trim() === ""
    ) {
        return [];
    }

    const ids =
        String(value)
            .split(/[;,]/)
            .map(item =>
                Number(item.trim())
            );

    if (
        ids.some(
            id =>
                !Number.isInteger(id) ||
                id <= 0
        )
    ) {
        throw new ApiError(
            400,
            `${fieldName} phải là danh sách ID nguyên dương, phân cách bằng dấu phẩy.`
        );
    }

    return [...new Set(ids)];
}

function parseDateTime(
    value,
    fieldName
) {
    if (value === undefined) {
        return undefined;
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        throw new ApiError(
            400,
            `${fieldName} không hợp lệ.`
        );
    }

    return date;
}

function readItem(
    row,
    rowNumber,
    getValue,
    keyConfig
) {
    const codeField =
        keyConfig.hasCodeKey
            ? "maVoucher/k"
            : "maVoucher";

    const item = {
        rowNumbers: [rowNumber],
        idIsKey:
            keyConfig.hasIdKey,
        codeIsKey:
            keyConfig.hasCodeKey,

        id:
            keyConfig.hasIdKey
                ? getValue(row, "id/k")
                : undefined,

        code:
            getValue(row, codeField),

        maVoucher:
            getValue(row, codeField),

        tenVoucher:
            getValue(row, "tenVoucher"),

        moTa:
            getValue(row, "moTa"),

        thoiGianBatDau:
            getValue(
                row,
                "thoiGianBatDau"
            ),

        thoiGianKetThuc:
            getValue(
                row,
                "thoiGianKetThuc"
            )
    };

    for (
        const key of
        Object.keys(numberFields)
    ) {
        item[key] =
            getValue(row, key);
    }

    for (
        const key of
        booleanFields
    ) {
        item[key] =
            getValue(row, key);
    }

    for (
        const key of
        relationFields
    ) {
        item[key] =
            getValue(row, key);
    }

    return item;
}

function createBusinessData(item) {
    const data = {};

    for (
        const key of
        [
            "tenVoucher",
            "moTa"
        ]
    ) {
        if (item[key] !== undefined) {
            data[key] = item[key];
        }
    }

    for (
        const [key, fieldName] of
        Object.entries(numberFields)
    ) {
        const value =
            parseNumberField(
                item[key],
                fieldName,
                integerFields.has(key)
            );

        if (value !== undefined) {
            data[key] = value;
        }
    }

    for (
        const key of
        booleanFields
    ) {
        const value =
            parseBooleanField(
                item[key],
                key
            );

        if (value !== undefined) {
            data[key] = value;
        }
    }

    for (
        const key of
        relationFields
    ) {
        const value =
            parseIdList(
                item[key],
                key
            );

        if (value !== undefined) {
            data[key] = value;
        }
    }

    const thoiGianBatDau =
        parseDateTime(
            item.thoiGianBatDau,
            "Thời gian bắt đầu"
        );

    if (thoiGianBatDau !== undefined) {
        data.thoiGianBatDau =
            thoiGianBatDau;
    }

    const thoiGianKetThuc =
        parseDateTime(
            item.thoiGianKetThuc,
            "Thời gian kết thúc"
        );

    if (thoiGianKetThuc !== undefined) {
        data.thoiGianKetThuc =
            thoiGianKetThuc;
    }

    return data;
}

async function processItem(
    item,
    user
) {
    if (item.id !== undefined) {
        item.id =
            parsePositiveInteger(
                item.id,
                "ID voucher đơn hàng"
            );
    }

    const strategy =
        await resolveImportStrategy(
            item,
            {
                getById:
                    id =>
                        voucherDonHangRepository
                            .getChiTiet(id),

                getByCode:
                    code =>
                        voucherDonHangRepository
                            .getChiTietByMa(code),

                getRecordCode:
                    record =>
                        record.maVoucher,

                entityName:
                    "voucher đơn hàng"
            }
        );

    const data =
        createBusinessData(item);

    if (
        strategy.action ===
        "UPDATE"
    ) {
        if (
            strategy.allowCodeChange &&
            item.maVoucher !== undefined &&
            shouldChangeCode(
                item.maVoucher,
                strategy.record.maVoucher
            )
        ) {
            data.maVoucher =
                item.maVoucher;
        }

        if (
            Object.keys(data).length === 0
        ) {
            throw new ApiError(
                400,
                "Không có dữ liệu cần cập nhật."
            );
        }

        const result =
            await voucherDonHangService
                .update(
                    strategy.record.id,
                    data
                );

        return {
            rowNumbers:
                item.rowNumbers,
            id:
                result.id,
            maVoucher:
                result.maVoucher,
            hanhDong:
                "CAP_NHAT",
            message:
                `Cập nhật thành công - ID ${result.id}`
        };
    }

    if (!item.maVoucher) {
        throw new ApiError(
            400,
            "Thêm mới voucher đơn hàng phải có mã voucher."
        );
    }

    data.maVoucher =
        item.maVoucher;

    const result =
        await voucherDonHangService
            .create(
                data,
                user
            );

    return {
        rowNumbers:
            item.rowNumbers,
        id:
            result.id,
        maVoucher:
            result.maVoucher,
        hanhDong:
            "THEM_MOI",
        message:
            `Thêm mới thành công - ID ${result.id}`
    };
}

async function importVoucherDonHang(
    file,
    user
) {
    const {
        workbook,
        worksheet,
        headerMap,
        getValue,
        hasData
    } = await readExcel(
        file,
        {
            headerRowNumber:
                HEADER_ROW
        }
    );

    const keyConfig =
        validateKeyHeaders(
            headerMap,
            {
                idKey:
                    "id/k",
                codeKey:
                    "maVoucher/k",
                codeField:
                    "maVoucher"
            }
        );

    const items = [];

    for (
        let rowNumber =
            DATA_START_ROW;
        rowNumber <=
            worksheet.rowCount;
        rowNumber++
    ) {
        const row =
            worksheet.getRow(
                rowNumber
            );

        if (!hasData(row)) {
            continue;
        }

        items.push(
            readItem(
                row,
                rowNumber,
                getValue,
                keyConfig
            )
        );
    }

    const successes = [];
    const errors = [];

    if (items.length === 0) {
        errors.push({
            rowNumbers: [
                DATA_START_ROW
            ],
            message:
                "File import không có dữ liệu."
        });
    }

    for (const item of items) {
        try {
            const result =
                await processItem(
                    item,
                    user
                );

            successes.push(result);
        } catch (error) {
            errors.push({
                rowNumbers:
                    item.rowNumbers,
                message:
                    error.message ||
                    "Dữ liệu không hợp lệ."
            });
        }
    }

    return createResultFile(
        workbook,
        worksheet,
        {
            fileName:
                `${MA_BAO_CAO}.xlsx`,
            headerRowNumber:
                HEADER_ROW,
            successes,
            errors
        }
    );
}

module.exports = {
    importVoucherDonHang
};