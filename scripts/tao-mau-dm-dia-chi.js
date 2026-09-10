"use strict";

const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");


async function taoFileMau() {

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "KitchenFlow";
    workbook.created = new Date();

    const worksheet =
        workbook.addWorksheet(
            "dm_dia_chi",
            {
                views: [
                    {
                        state: "frozen",
                        ySplit: 4
                    }
                ]
            }
        );


    worksheet.columns = [

        {
            key: "id",
            width: 16
        },

        {
            key: "maDiaChi",
            width: 24
        },

        {
            key: "tenDiaChi",
            width: 55
        },

        {
            key: "quocGiaId",
            width: 18
        },

        {
            key: "maQuocGia",
            width: 20
        },

        {
            key: "tenQuocGia",
            width: 30
        },

        {
            key: "tenTiengAnh",
            width: 30
        },

        {
            key: "quocGiaTenVietTat",
            width: 24
        },

        {
            key: "maDienThoai",
            width: 18
        },

        {
            key: "maIso2",
            width: 15
        },

        {
            key: "maIso3",
            width: 15
        },

        {
            key: "quocGiaActive",
            width: 20
        },

        {
            key: "tinhThanhId",
            width: 20
        },

        {
            key: "maTinhThanh",
            width: 22
        },

        {
            key: "tenTinhThanh",
            width: 30
        },

        {
            key: "tinhThanhTenVietTat",
            width: 26
        },

        {
            key: "tinhThanhActive",
            width: 20
        },

        {
            key: "xaPhuongId",
            width: 20
        },

        {
            key: "maXaPhuong",
            width: 22
        },

        {
            key: "tenXaPhuong",
            width: 32
        },

        {
            key: "xaPhuongTenVietTat",
            width: 26
        },

        {
            key: "xaPhuongActive",
            width: 20
        },

        {
            key: "active",
            width: 20
        }

    ];


    worksheet.mergeCells(
        "A1:W1"
    );

    const huongDan =
        worksheet.getCell(
            "A1"
        );

    huongDan.value =
        [
            "Hướng dẫn:",
            "",
            "1. Không chỉnh sửa dòng 1 đến dòng 4.",
            "2. dm_dia_chi là dữ liệu tổng hợp từ Quốc gia, Tỉnh/Thành phố và Xã/Phường.",
            "3. File này dùng để xuất dữ liệu địa chỉ tổng hợp.",
            "4. Không cập nhật trực tiếp dữ liệu qua dm_dia_chi.",
            "5. Muốn thay đổi Quốc gia, Tỉnh/Thành phố hoặc Xã/Phường phải cập nhật tại danh mục tương ứng.",
            "6. maDiaChi và tenDiaChi được tổng hợp từ dữ liệu Xã/Phường.",
            "7. active thể hiện trạng thái tổng hợp của địa chỉ.",
            "8. Các trường trạng thái TRUE = hoạt động; FALSE = khóa."
        ].join("\n");

    huongDan.font = {
        bold: true,
        size: 12
    };

    huongDan.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "FFFCE49A"
        }
    };

    huongDan.alignment = {
        vertical: "top",
        horizontal: "left",
        wrapText: true
    };

    worksheet
        .getRow(1)
        .height = 180;


    worksheet
        .getRow(2)
        .values = [

        "Number",
        "Text",
        "Text",

        "Number",
        "Text",
        "Text",
        "Text",
        "Text",
        "Text",
        "Text",
        "Text",
        "Boolean",

        "Number",
        "Text",
        "Text",
        "Text",
        "Boolean",

        "Number",
        "Text",
        "Text",
        "Text",
        "Boolean",

        "Boolean"

    ];

    worksheet
        .getRow(2)
        .font = {
        bold: true,
        color: {
            argb: "FF374151"
        }
    };


    worksheet
        .getRow(3)
        .values = [

        "id",
        "maDiaChi",
        "tenDiaChi",

        "quocGiaId",
        "maQuocGia",
        "tenQuocGia",
        "tenTiengAnh",
        "quocGiaTenVietTat",
        "maDienThoai",
        "maIso2",
        "maIso3",
        "quocGiaActive",

        "tinhThanhId",
        "maTinhThanh",
        "tenTinhThanh",
        "tinhThanhTenVietTat",
        "tinhThanhActive",

        "xaPhuongId",
        "maXaPhuong",
        "tenXaPhuong",
        "xaPhuongTenVietTat",
        "xaPhuongActive",

        "active"

    ];

    worksheet
        .getRow(3)
        .font = {
        bold: true,
        color: {
            argb: "FFFF0000"
        }
    };


    worksheet
        .getRow(4)
        .values = [

        [
            "ID địa chỉ",
            "ID tổng hợp của địa chỉ"
        ].join("\n"),

        [
            "Mã địa chỉ",
            "Mã tổng hợp của địa chỉ"
        ].join("\n"),

        [
            "Tên địa chỉ",
            "Tên đầy đủ Xã/Phường, Tỉnh/Thành phố, Quốc gia"
        ].join("\n"),

        [
            "ID Quốc gia"
        ].join("\n"),

        [
            "Mã Quốc gia"
        ].join("\n"),

        [
            "Tên Quốc gia"
        ].join("\n"),

        [
            "Tên tiếng Anh Quốc gia"
        ].join("\n"),

        [
            "Tên viết tắt Quốc gia"
        ].join("\n"),

        [
            "Mã điện thoại Quốc gia"
        ].join("\n"),

        [
            "Mã ISO2"
        ].join("\n"),

        [
            "Mã ISO3"
        ].join("\n"),

        [
            "Trạng thái Quốc gia",
            "TRUE: Hoạt động",
            "FALSE: Khóa"
        ].join("\n"),

        [
            "ID Tỉnh/Thành phố"
        ].join("\n"),

        [
            "Mã Tỉnh/Thành phố"
        ].join("\n"),

        [
            "Tên Tỉnh/Thành phố"
        ].join("\n"),

        [
            "Tên viết tắt Tỉnh/Thành phố"
        ].join("\n"),

        [
            "Trạng thái Tỉnh/Thành phố",
            "TRUE: Hoạt động",
            "FALSE: Khóa"
        ].join("\n"),

        [
            "ID Xã/Phường"
        ].join("\n"),

        [
            "Mã Xã/Phường"
        ].join("\n"),

        [
            "Tên Xã/Phường"
        ].join("\n"),

        [
            "Tên viết tắt Xã/Phường"
        ].join("\n"),

        [
            "Trạng thái Xã/Phường",
            "TRUE: Hoạt động",
            "FALSE: Khóa"
        ].join("\n"),

        [
            "Trạng thái địa chỉ",
            "TRUE: Hoạt động",
            "FALSE: Khóa"
        ].join("\n")

    ];

    worksheet
        .getRow(4)
        .height = 100;

    worksheet
        .getRow(4)
        .font = {
        bold: true,
        color: {
            argb: "FF2563EB"
        }
    };

    worksheet
        .getRow(4)
        .alignment = {
        vertical: "top",
        wrapText: true
    };


    worksheet
        .getRow(5)
        .values = [

        "[[dmDiaChi.id]]",
        "[[dmDiaChi.maDiaChi]]",
        "[[dmDiaChi.tenDiaChi]]",

        "[[dmDiaChi.quocGiaId]]",
        "[[dmDiaChi.maQuocGia]]",
        "[[dmDiaChi.tenQuocGia]]",
        "[[dmDiaChi.tenTiengAnh]]",
        "[[dmDiaChi.quocGiaTenVietTat]]",
        "[[dmDiaChi.maDienThoai]]",
        "[[dmDiaChi.maIso2]]",
        "[[dmDiaChi.maIso3]]",
        "[[dmDiaChi.quocGiaActive]]",

        "[[dmDiaChi.tinhThanhId]]",
        "[[dmDiaChi.maTinhThanh]]",
        "[[dmDiaChi.tenTinhThanh]]",
        "[[dmDiaChi.tinhThanhTenVietTat]]",
        "[[dmDiaChi.tinhThanhActive]]",

        "[[dmDiaChi.xaPhuongId]]",
        "[[dmDiaChi.maXaPhuong]]",
        "[[dmDiaChi.tenXaPhuong]]",
        "[[dmDiaChi.xaPhuongTenVietTat]]",
        "[[dmDiaChi.xaPhuongActive]]",

        "[[dmDiaChi.active]]"

    ];

    worksheet
        .getRow(5)
        .height = 30;

    worksheet
        .getRow(5)
        .font = {
        color: {
            argb: "FF059669"
        }
    };


    for (
        let rowNumber = 2;
        rowNumber <= 5;
        rowNumber++
    ) {

        const row =
            worksheet.getRow(
                rowNumber
            );

        row.eachCell(
            {
                includeEmpty: true
            },
            cell => {

                cell.border = {

                    top: {
                        style: "thin",
                        color: {
                            argb: "FFD1D5DB"
                        }
                    },

                    left: {
                        style: "thin",
                        color: {
                            argb: "FFD1D5DB"
                        }
                    },

                    bottom: {
                        style: "thin",
                        color: {
                            argb: "FFD1D5DB"
                        }
                    },

                    right: {
                        style: "thin",
                        color: {
                            argb: "FFD1D5DB"
                        }
                    }

                };

                cell.alignment = {
                    ...cell.alignment,
                    vertical: "top",
                    wrapText: true
                };

            }
        );

    }


    worksheet.autoFilter = {
        from: "A3",
        to: "W3"
    };


    const booleanColumns = [
        12,
        17,
        22,
        23
    ];

    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {

        for (const columnNumber of booleanColumns) {

            worksheet
                .getCell(
                    rowNumber,
                    columnNumber
                )
                .dataValidation = {

                type: "list",
                allowBlank: true,

                formulae: [
                    '"TRUE,FALSE"'
                ],

                showErrorMessage: true,

                errorTitle:
                    "Trạng thái không hợp lệ",

                error:
                    "Chỉ được nhập TRUE hoặc FALSE."

            };

        }

    }


    const outputDirectory =
        path.join(
            process.cwd(),
            "templates"
        );

    if (
        !fs.existsSync(
            outputDirectory
        )
    ) {

        fs.mkdirSync(
            outputDirectory,
            {
                recursive: true
            }
        );

    }


    const outputPath =
        path.join(
            outputDirectory,
            "dm_dia_chi.xlsx"
        );

    await workbook.xlsx.writeFile(
        outputPath
    );

    console.log(
        `Đã tạo file mẫu: ${outputPath}`
    );

}


taoFileMau()
    .catch(
        error => {

            console.error(
                error
            );

            process.exit(
                1
            );

        }
    );