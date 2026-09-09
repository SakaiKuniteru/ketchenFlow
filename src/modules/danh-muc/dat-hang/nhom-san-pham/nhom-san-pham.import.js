"use strict";

const ApiError =
    require(
        "../../../../utils/api-error"
    );

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

const nhomSanPhamRepository =
    require(
        "./nhom-san-pham.repository"
    );

const nhomSanPhamService =
    require(
        "./nhom-san-pham.service"
    );

const {
    MA_BAO_CAO,
    HEADER_ROW,
    DATA_START_ROW
} = require(
    "./nhom-san-pham.export"
);


function parsePositiveInteger(
    value,
    fieldName
) {

    if (
        value === undefined
    ) {
        return undefined;
    }

    const number =
        toNumber(
            value
        );

    if (
        number === null ||
        !Number.isInteger(
            number
        ) ||
        number <= 0
    ) {

        throw new ApiError(
            400,
            `${fieldName} phải là số nguyên lớn hơn 0.`
        );

    }

    return number;

}


function parseInteger(
    value,
    fieldName
) {

    if (
        value === undefined
    ) {
        return undefined;
    }

    const number =
        toNumber(
            value
        );

    if (
        number === null ||
        !Number.isInteger(
            number
        )
    ) {

        throw new ApiError(
            400,
            `${fieldName} phải là số nguyên.`
        );

    }

    return number;

}


function parseNonNegativeInteger(
    value,
    fieldName
) {

    const number =
        parseInteger(
            value,
            fieldName
        );

    if (
        number !== undefined &&
        number < 0
    ) {

        throw new ApiError(
            400,
            `${fieldName} không được nhỏ hơn 0.`
        );

    }

    return number;

}


function parseBoolean(
    value
) {

    if (
        value === undefined
    ) {
        return undefined;
    }

    try {

        return toBoolean(
            value
        );

    } catch (error) {

        throw new ApiError(
            400,
            "Trạng thái không hợp lệ."
        );

    }

}


function readItem(
    row,
    rowNumber,
    getValue,
    keyConfig
) {

    const codeField =
        keyConfig.hasCodeKey
            ? "maNhomSanPham/k"
            : "maNhomSanPham";

    return {

        rowNumbers: [
            rowNumber
        ],

        idIsKey:
            keyConfig.hasIdKey,

        codeIsKey:
            keyConfig.hasCodeKey,

        id:
            keyConfig.hasIdKey
                ? getValue(
                    row,
                    "id/k"
                )
                : undefined,

        code:
            getValue(
                row,
                codeField
            ),

        maNhomSanPham:
            getValue(
                row,
                codeField
            ),

        tenNhomSanPham:
            getValue(
                row,
                "tenNhomSanPham"
            ),

        loaiSanPham:
            getValue(
                row,
                "loaiSanPham"
            ),

        moTa:
            getValue(
                row,
                "moTa"
            ),

        thuTuHienThi:
            getValue(
                row,
                "thuTuHienThi"
            ),

        active:
            getValue(
                row,
                "active"
            )

    };

}


function createBusinessData(
    item
) {

    const data =
        {};

    if (
        item.tenNhomSanPham !==
        undefined
    ) {

        data.tenNhomSanPham =
            item.tenNhomSanPham;

    }

    const loaiSanPham =
        parseInteger(
            item.loaiSanPham,
            "Loại sản phẩm"
        );

    if (
        loaiSanPham !==
        undefined
    ) {

        data.loaiSanPham =
            loaiSanPham;

    }

    if (
        item.moTa !==
        undefined
    ) {

        data.moTa =
            item.moTa;

    }

    const thuTuHienThi =
        parseNonNegativeInteger(
            item.thuTuHienThi,
            "Thứ tự hiển thị"
        );

    if (
        thuTuHienThi !==
        undefined
    ) {

        data.thuTuHienThi =
            thuTuHienThi;

    }

    const active =
        parseBoolean(
            item.active
        );

    if (
        active !==
        undefined
    ) {

        data.active =
            active;

    }

    return data;

}


async function processItem(
    item
) {

    if (
        item.id !==
        undefined
    ) {

        item.id =
            parsePositiveInteger(
                item.id,
                "ID nhóm sản phẩm"
            );

    }

    const strategy =
        await resolveImportStrategy(
            item,
            {

                getById:
                    id =>
                        nhomSanPhamRepository
                            .getChiTiet(
                                id
                            ),

                getByCode:
                    code =>
                        nhomSanPhamRepository
                            .getChiTietByMa(
                                code
                            ),

                getRecordCode:
                    record =>
                        record.maNhomSanPham,

                entityName:
                    "nhóm sản phẩm"

            }
        );

    const data =
        createBusinessData(
            item
        );

    if (
        strategy.action ===
        "UPDATE"
    ) {

        if (
            strategy.allowCodeChange &&
            item.maNhomSanPham !==
                undefined &&
            shouldChangeCode(
                item.maNhomSanPham,
                strategy.record.maNhomSanPham
            )
        ) {

            data.maNhomSanPham =
                item.maNhomSanPham;

        }

        if (
            Object.keys(
                data
            ).length ===
            0
        ) {

            throw new ApiError(
                400,
                "Không có dữ liệu cần cập nhật."
            );

        }

        const result =
            await nhomSanPhamService
                .update(
                    strategy.record.id,
                    data
                );

        return {

            rowNumbers:
                item.rowNumbers,

            id:
                result.id,

            maNhomSanPham:
                result.maNhomSanPham,

            hanhDong:
                "CAP_NHAT",

            message:
                `Cập nhật thành công - ID ${result.id}`

        };

    }

    if (
        !item.maNhomSanPham
    ) {

        throw new ApiError(
            400,
            "Thêm mới nhóm sản phẩm phải có mã nhóm sản phẩm."
        );

    }

    data.maNhomSanPham =
        item.maNhomSanPham;

    const result =
        await nhomSanPhamService
            .create(
                data
            );

    return {

        rowNumbers:
            item.rowNumbers,

        id:
            result.id,

        maNhomSanPham:
            result.maNhomSanPham,

        hanhDong:
            "THEM_MOI",

        message:
            `Thêm mới thành công - ID ${result.id}`

    };

}


async function importNhomSanPham(
    file
) {

    const {
        workbook,
        worksheet,
        headerMap,
        getValue,
        hasData
    } =
        await readExcel(
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
                    "maNhomSanPham/k",

                codeField:
                    "maNhomSanPham"

            }
        );

    const items =
        [];

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

        if (
            !hasData(
                row
            )
        ) {
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

    const successes =
        [];

    const errors =
        [];

    if (
        items.length ===
        0
    ) {

        errors.push({

            rowNumbers: [
                DATA_START_ROW
            ],

            message:
                "File import không có dữ liệu."

        });

    }

    for (
        const item of
        items
    ) {

        try {

            const result =
                await processItem(
                    item
                );

            successes.push(
                result
            );

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
    importNhomSanPham
};