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
            "dm_nha_an",
            {
                views: [
                    {
                        state:
                            "frozen",

                        ySplit:
                            4
                    }
                ]
            }
        );


    /* =========================================================
       CẤU HÌNH CỘT
       ========================================================= */

    worksheet.columns = [

        {
            key:
                "id",

            width:
                16
        },

        {
            key:
                "maNhaAn",

            width:
                22
        },

        {
            key:
                "tenNhaAn",

            width:
                32
        },

        {
            key:
                "coSoId",

            width:
                18
        },

        {
            key:
                "maCoSo",

            width:
                22
        },

        {
            key:
                "dsNvQuanLyId",

            width:
                32
        },

        {
            key:
                "dsMaNvQuanLy",

            width:
                40
        },

        {
            key:
                "active",

            width:
                20
        }

    ];


    /* =========================================================
       DÒNG 1: HƯỚNG DẪN
       ========================================================= */

    worksheet.mergeCells(
        "A1:H1"
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
            "2. Các trường có hậu tố /k là khóa tìm bản ghi và không được cập nhật.",
            "3. Có id/k: cập nhật nhà ăn theo ID.",
            "4. Có maNhaAn/k: cập nhật nhà ăn theo mã.",
            "5. Có cả id/k và maNhaAn/k: hệ thống kiểm tra ID và mã phải cùng một nhà ăn.",
            "6. Khi thêm mới: mã nhà ăn và tên nhà ăn là bắt buộc.",
            "7. Cơ sở có thể xác định bằng coSoId hoặc maCoSo.",
            "8. Nếu có cả coSoId và maCoSo thì hai giá trị phải cùng một cơ sở.",
            "9. dsNvQuanLyId là danh sách ID nhân viên quản lý, ngăn cách bằng dấu phẩy. Ví dụ: 1,2,5.",
            "10. dsMaNvQuanLy là danh sách mã nhân viên quản lý, ngăn cách bằng dấu phẩy. Ví dụ: NV001,NV002,NV005.",
            "11. Nếu truyền đồng thời dsNvQuanLyId và dsMaNvQuanLy thì hai danh sách phải trỏ tới cùng tập nhân viên.",
            "12. Có thể để trống danh sách nhân viên quản lý.",
            "13. active: TRUE = hoạt động; FALSE = khóa.",
            "14. Khi thêm mới nếu active để trống thì mặc định TRUE."
        ].join(
            "\n"
        );


    huongDan.font = {

        bold:
            true,

        size:
            12

    };


    huongDan.fill = {

        type:
            "pattern",

        pattern:
            "solid",

        fgColor: {
            argb:
                "FFFCE49A"
        }

    };


    huongDan.alignment = {

        vertical:
            "top",

        horizontal:
            "left",

        wrapText:
            true

    };


    worksheet
        .getRow(1)
        .height =
        245;


    /* =========================================================
       DÒNG 2: KIỂU DỮ LIỆU
       ========================================================= */

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

        "Boolean"

    ];


    worksheet
        .getRow(2)
        .font = {

        bold:
            true,

        color: {
            argb:
                "FF374151"
        }

    };


    /* =========================================================
       DÒNG 3: FIELD IMPORT
       ========================================================= */

    worksheet
        .getRow(3)
        .values = [

        "id/k",

        "maNhaAn/k",

        "tenNhaAn",

        "coSoId",

        "maCoSo",

        "dsNvQuanLyId",

        "dsMaNvQuanLy",

        "active"

    ];


    worksheet
        .getRow(3)
        .font = {

        bold:
            true,

        color: {
            argb:
                "FFFF0000"
        }

    };


    /* =========================================================
       DÒNG 4: MÔ TẢ
       ========================================================= */

    worksheet
        .getRow(4)
        .values = [

        [
            "Khóa ID",
            "Có giá trị: tìm nhà ăn theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã nhà ăn",
            "Có giá trị: tìm nhà ăn theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên nhà ăn",
            "Bắt buộc khi thêm mới",
            "Không được trùng"
        ].join("\n"),


        [
            "ID cơ sở",
            "Có thể dùng coSoId hoặc maCoSo",
            "ID phải là số nguyên > 0"
        ].join("\n"),


        [
            "Mã cơ sở",
            "Có thể dùng thay coSoId",
            "Cơ sở phải tồn tại và hoạt động"
        ].join("\n"),


        [
            "Danh sách ID nhân viên quản lý",
            "Ngăn cách bằng dấu phẩy",
            "Ví dụ: 1,2,5",
            "Có thể để trống"
        ].join("\n"),


        [
            "Danh sách mã nhân viên quản lý",
            "Ngăn cách bằng dấu phẩy",
            "Ví dụ: NV001,NV002,NV005",
            "Có thể để trống"
        ].join("\n"),


        [
            "Trạng thái",
            "TRUE: Hoạt động",
            "FALSE: Khóa",
            "Để trống khi thêm mới: mặc định TRUE"
        ].join("\n")

    ];


    worksheet
        .getRow(4)
        .height =
        115;


    worksheet
        .getRow(4)
        .font = {

        bold:
            true,

        color: {
            argb:
                "FF2563EB"
        }

    };


    worksheet
        .getRow(4)
        .alignment = {

        vertical:
            "top",

        wrapText:
            true

    };


    /* =========================================================
       DÒNG 5: KEY EXPORT
       ========================================================= */

    worksheet
        .getRow(5)
        .values = [

        "[[dmNhaAn.id]]",

        "[[dmNhaAn.maNhaAn]]",

        "[[dmNhaAn.tenNhaAn]]",

        "[[dmNhaAn.coSoId]]",

        "[[dmNhaAn.maCoSo]]",

        "[[dmNhaAn.dsNvQuanLyId]]",

        "[[dmNhaAn.dsMaNvQuanLy]]",

        "[[dmNhaAn.active]]"

    ];


    worksheet
        .getRow(5)
        .height =
        30;


    worksheet
        .getRow(5)
        .font = {

        color: {
            argb:
                "FF059669"
        }

    };


    /* =========================================================
       STYLE DÒNG 2 → 5
       ========================================================= */

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
                includeEmpty:
                    true
            },
            cell => {

                cell.border = {

                    top: {
                        style:
                            "thin",

                        color: {
                            argb:
                                "FFD1D5DB"
                        }
                    },

                    left: {
                        style:
                            "thin",

                        color: {
                            argb:
                                "FFD1D5DB"
                        }
                    },

                    bottom: {
                        style:
                            "thin",

                        color: {
                            argb:
                                "FFD1D5DB"
                        }
                    },

                    right: {
                        style:
                            "thin",

                        color: {
                            argb:
                                "FFD1D5DB"
                        }
                    }

                };


                cell.alignment = {

                    ...cell.alignment,

                    vertical:
                        "top",

                    wrapText:
                        true

                };

            }
        );

    }


    /* =========================================================
       AUTO FILTER
       ========================================================= */

    worksheet.autoFilter = {

        from:
            "A3",

        to:
            "H3"

    };


    /* =========================================================
       VALIDATION
       ========================================================= */

    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {


        /* -----------------------------------------------------
           ID NHÀ ĂN
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                1
            )
            .dataValidation = {

            type:
                "whole",

            operator:
                "greaterThan",

            allowBlank:
                true,

            formulae: [
                0
            ],

            showErrorMessage:
                true,

            errorTitle:
                "ID nhà ăn không hợp lệ",

            error:
                "ID nhà ăn phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ID CƠ SỞ
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                4
            )
            .dataValidation = {

            type:
                "whole",

            operator:
                "greaterThan",

            allowBlank:
                true,

            formulae: [
                0
            ],

            showErrorMessage:
                true,

            errorTitle:
                "ID cơ sở không hợp lệ",

            error:
                "ID cơ sở phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ACTIVE
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                8
            )
            .dataValidation = {

            type:
                "list",

            allowBlank:
                true,

            formulae: [
                '"TRUE,FALSE"'
            ],

            showErrorMessage:
                true,

            errorTitle:
                "Trạng thái không hợp lệ",

            error:
                "Chỉ được nhập TRUE hoặc FALSE."

        };

    }


    /* =========================================================
       OUTPUT DIRECTORY
       ========================================================= */

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
                recursive:
                    true
            }
        );

    }


    /* =========================================================
       OUTPUT FILE
       ========================================================= */

    const outputPath =
        path.join(
            outputDirectory,
            "dm_nha_an.xlsx"
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