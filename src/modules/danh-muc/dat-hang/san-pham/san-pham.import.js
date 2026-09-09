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

const sanPhamRepository =
    require(
        "./san-pham.repository"
    );

const sanPhamService =
    require(
        "./san-pham.service"
    );

const {
    MA_BAO_CAO,
    HEADER_ROW,
    DATA_START_ROW
} = require(
    "./san-pham.export"
);


function parseNumber(
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
        number === null
    ) {

        throw new ApiError(
            400,
            `${fieldName} phải là số.`
        );

    }

    return number;

}


function parsePositiveNumber(
    value,
    fieldName
) {

    const number =
        parseNumber(
            value,
            fieldName
        );

    if (
        number !== undefined &&
        number <= 0
    ) {

        throw new ApiError(
            400,
            `${fieldName} phải lớn hơn 0.`
        );

    }

    return number;

}


function parseNonNegativeNumber(
    value,
    fieldName
) {

    const number =
        parseNumber(
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


function parsePositiveInteger(
    value,
    fieldName
) {

    const number =
        parsePositiveNumber(
            value,
            fieldName
        );

    if (
        number !== undefined &&
        !Number.isInteger(
            number
        )
    ) {

        throw new ApiError(
            400,
            `${fieldName} phải là số nguyên lớn hơn 0.`
        );

    }

    return number;

}


function parseNonNegativeInteger(
    value,
    fieldName
) {

    const number =
        parseNonNegativeNumber(
            value,
            fieldName
        );

    if (
        number !== undefined &&
        !Number.isInteger(
            number
        )
    ) {

        throw new ApiError(
            400,
            `${fieldName} phải là số nguyên không âm.`
        );

    }

    return number;

}


function parseBoolean(
    value,
    fieldName
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
            `${fieldName} không hợp lệ.`
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
            ? "maSanPham/k"
            : "maSanPham";

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

        maSanPham:
            getValue(
                row,
                codeField
            ),

        tenSanPham:
            getValue(
                row,
                "tenSanPham"
            ),

        nhomSanPhamId:
            getValue(
                row,
                "nhomSanPhamId"
            ),

        donViTinhId:
            getValue(
                row,
                "donViTinhId"
            ),

        giaBan:
            getValue(
                row,
                "giaBan"
            ),

        moTa:
            getValue(
                row,
                "moTa"
            ),

        hinhAnh:
            getValue(
                row,
                "hinhAnh"
            ),

        choPhepDat:
            getValue(
                row,
                "choPhepDat"
            ),

        laSanPhamMoi:
            getValue(
                row,
                "laSanPhamMoi"
            ),

        laSanPhamNoiBat:
            getValue(
                row,
                "laSanPhamNoiBat"
            ),

        soLuongToiThieu:
            getValue(
                row,
                "soLuongToiThieu"
            ),

        soLuongToiDa:
            getValue(
                row,
                "soLuongToiDa"
            ),

        buocSoLuong:
            getValue(
                row,
                "buocSoLuong"
            ),

        thoiGianChuanBiPhut:
            getValue(
                row,
                "thoiGianChuanBiPhut"
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
        item.tenSanPham !==
        undefined
    ) {

        data.tenSanPham =
            item.tenSanPham;

    }

    const nhomSanPhamId =
        parsePositiveInteger(
            item.nhomSanPhamId,
            "Nhóm sản phẩm"
        );

    if (
        nhomSanPhamId !==
        undefined
    ) {

        data.nhomSanPhamId =
            nhomSanPhamId;

    }

    const donViTinhId =
        parsePositiveInteger(
            item.donViTinhId,
            "Đơn vị tính"
        );

    if (
        donViTinhId !==
        undefined
    ) {

        data.donViTinhId =
            donViTinhId;

    }

    const giaBan =
        parseNonNegativeNumber(
            item.giaBan,
            "Giá bán"
        );

    if (
        giaBan !==
        undefined
    ) {

        data.giaBan =
            giaBan;

    }

    if (
        item.moTa !==
        undefined
    ) {

        data.moTa =
            item.moTa;

    }

    if (
        item.hinhAnh !==
        undefined
    ) {

        data.hinhAnh =
            item.hinhAnh;

    }

    const choPhepDat =
        parseBoolean(
            item.choPhepDat,
            "Cho phép đặt"
        );

    if (
        choPhepDat !==
        undefined
    ) {

        data.choPhepDat =
            choPhepDat;

    }

    const laSanPhamMoi =
        parseBoolean(
            item.laSanPhamMoi,
            "Sản phẩm mới"
        );

    if (
        laSanPhamMoi !==
        undefined
    ) {

        data.laSanPhamMoi =
            laSanPhamMoi;

    }

    const laSanPhamNoiBat =
        parseBoolean(
            item.laSanPhamNoiBat,
            "Sản phẩm nổi bật"
        );

    if (
        laSanPhamNoiBat !==
        undefined
    ) {

        data.laSanPhamNoiBat =
            laSanPhamNoiBat;

    }

    const soLuongToiThieu =
        parsePositiveNumber(
            item.soLuongToiThieu,
            "Số lượng tối thiểu"
        );

    if (
        soLuongToiThieu !==
        undefined
    ) {

        data.soLuongToiThieu =
            soLuongToiThieu;

    }

    const soLuongToiDa =
        parsePositiveNumber(
            item.soLuongToiDa,
            "Số lượng tối đa"
        );

    if (
        soLuongToiDa !==
        undefined
    ) {

        data.soLuongToiDa =
            soLuongToiDa;

    }

    const buocSoLuong =
        parsePositiveNumber(
            item.buocSoLuong,
            "Bước số lượng"
        );

    if (
        buocSoLuong !==
        undefined
    ) {

        data.buocSoLuong =
            buocSoLuong;

    }

    const thoiGianChuanBiPhut =
        parseNonNegativeInteger(
            item.thoiGianChuanBiPhut,
            "Thời gian chuẩn bị"
        );

    if (
        thoiGianChuanBiPhut !==
        undefined
    ) {

        data.thoiGianChuanBiPhut =
            thoiGianChuanBiPhut;

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
            item.active,
            "Trạng thái"
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
                "ID sản phẩm"
            );

    }

    const strategy =
        await resolveImportStrategy(
            item,
            {

                getById:
                    id =>
                        sanPhamRepository
                            .getChiTiet(
                                id
                            ),

                getByCode:
                    code =>
                        sanPhamRepository
                            .getChiTietByMa(
                                code
                            ),

                getRecordCode:
                    record =>
                        record.maSanPham,

                entityName:
                    "sản phẩm"

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
            item.maSanPham !==
                undefined &&
            shouldChangeCode(
                item.maSanPham,
                strategy.record.maSanPham
            )
        ) {

            data.maSanPham =
                item.maSanPham;

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
            await sanPhamService
                .update(
                    strategy.record.id,
                    data
                );

        return {

            rowNumbers:
                item.rowNumbers,

            id:
                result.id,

            maSanPham:
                result.maSanPham,

            hanhDong:
                "CAP_NHAT",

            message:
                `Cập nhật thành công - ID ${result.id}`

        };

    }

    if (
        !item.maSanPham
    ) {

        throw new ApiError(
            400,
            "Thêm mới sản phẩm phải có mã sản phẩm."
        );

    }

    data.maSanPham =
        item.maSanPham;

    const result =
        await sanPhamService
            .create(
                data
            );

    return {

        rowNumbers:
            item.rowNumbers,

        id:
            result.id,

        maSanPham:
            result.maSanPham,

        hanhDong:
            "THEM_MOI",

        message:
            `Thêm mới thành công - ID ${result.id}`

    };

}


async function importSanPham(
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
                    "maSanPham/k",

                codeField:
                    "maSanPham"

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
    importSanPham
};