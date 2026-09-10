const path =
    require("path");

const fs =
    require("fs");

const ExcelJS =
    require("exceljs");


async function taoFileMau() {

    const workbook =
        new ExcelJS.Workbook();

    workbook.creator =
        "KitchenFlow";

    workbook.created =
        new Date();

    const worksheet =
        workbook.addWorksheet(
            "dm_don_vi_tinh",
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
            width: 18
        },

        {
            key: "maDonViTinh",
            width: 24
        },

        {
            key: "tenDonViTinh",
            width: 30
        },

        {
            key: "kyHieu",
            width: 18
        },

        {
            key: "loaiDonVi",
            width: 25
        },

        {
            key: "active",
            width: 22
        }

    ];

    /*
     * Dòng 1: hướng dẫn.
     */
    worksheet.mergeCells(
        "A1:F1"
    );

    const huongDan =
        worksheet.getCell(
            "A1"
        );

    huongDan.value =
        [
            "Hướng dẫn:",
            "1. Không chỉnh sửa dòng 1 đến dòng 4.",
            "2. Các trường có hậu tố /k là khóa tìm bản ghi và không được cập nhật.",
            "3. Có id/k: cập nhật theo ID.",
            "4. Có maDonViTinh/k: cập nhật theo mã.",
            "5. Có cả ID và mã: hệ thống kiểm tra hai khóa có khớp cùng bản ghi hay không.",
            "6. Loại đơn vị: 10 = Khối lượng; 20 = Thể tích; 30 = Đếm.",
            "7. Trạng thái: TRUE = hoạt động; FALSE = khóa."
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
        wrapText: true
    };

    worksheet.getRow(1).height =
        145;

    /*
     * Dòng 2: kiểu dữ liệu.
     */
    worksheet.getRow(2).values = [

        "Number",

        "Text",

        "Text",

        "Text",

        "Number",

        "Boolean"

    ];

    /*
     * Dòng 3: field import.
     */
    worksheet.getRow(3).values = [

        "id/k",

        "maDonViTinh/k",

        "tenDonViTinh",

        "kyHieu",

        "loaiDonVi",

        "active"

    ];

    worksheet.getRow(3).font = {
        bold: true,
        color: {
            argb: "FFFF0000"
        }
    };

    /*
     * Dòng 4: mô tả.
     */
    worksheet.getRow(4).values = [

        "Khóa ID\nCó giá trị: tìm theo ID\nKhông cập nhật ID",

        "Khóa mã\nCó giá trị: tìm theo mã\nKhông cập nhật mã",

        "Tên đơn vị tính\nBắt buộc",

        "Ký hiệu\nCó thể để trống",

        "Loại đơn vị\n10: Khối lượng\n20: Thể tích\n30: Đếm",

        "Trạng thái\nTRUE: Hoạt động\nFALSE: Khóa"

    ];

    worksheet.getRow(4).height =
        85;

    worksheet.getRow(4).font = {
        bold: true,
        color: {
            argb: "FF2563EB"
        }
    };

    worksheet.getRow(4).alignment = {
        vertical: "top",
        wrapText: true
    };

    /*
     * Dòng 5: key export.
     */
    worksheet.getRow(5).values = [

        "[[dmDonViTinh.id]]",

        "[[dmDonViTinh.maDonViTinh]]",

        "[[dmDonViTinh.tenDonViTinh]]",

        "[[dmDonViTinh.kyHieu]]",

        "[[dmDonViTinh.loaiDonVi]]",

        "[[dmDonViTinh.active]]"

    ];

    worksheet.getRow(5).height =
        28;

    /*
     * Định dạng viền từ dòng 2 đến dòng 5.
     */
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

    /*
     * Validation cho vùng dữ liệu import.
     */
    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {

        worksheet.getCell(
            rowNumber,
            5
        ).dataValidation = {

            type: "list",

            allowBlank: false,

            formulae: [
                '"10,20,30"'
            ],

            showErrorMessage: true,

            errorTitle:
                "Loại đơn vị không hợp lệ",

            error:
                "Chỉ được nhập 10, 20 hoặc 30."

        };

        worksheet.getCell(
            rowNumber,
            6
        ).dataValidation = {

            type: "list",

            allowBlank: false,

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
            "dm_don_vi_tinh.xlsx"
        );

    await workbook.xlsx.writeFile(
        outputPath
    );

    console.log(
        `Đã tạo file mẫu: ${outputPath}`
    );

}


taoFileMau()
    .catch(error => {

        console.error(
            error
        );

        process.exit(1);

    });