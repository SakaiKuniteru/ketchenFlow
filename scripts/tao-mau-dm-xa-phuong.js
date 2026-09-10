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
            "dm_xa_phuong",
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
                18
        },

        {
            key:
                "maXaPhuong",

            width:
                26
        },

        {
            key:
                "tenXaPhuong",

            width:
                34
        },

        {
            key:
                "tenVietTat",

            width:
                24
        },

        {
            key:
                "tinhThanhId",

            width:
                20
        },

        {
            key:
                "maTinhThanh",

            width:
                24
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
        "A1:G1"
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
            "3. Có id/k: cập nhật Xã/Phường theo ID.",
            "4. Có maXaPhuong/k: cập nhật Xã/Phường theo mã.",
            "5. Có cả id/k và maXaPhuong/k: hệ thống kiểm tra ID và mã phải thuộc cùng một Xã/Phường.",
            "6. Khi thêm mới: mã Xã/Phường, tên Xã/Phường và Tỉnh/Thành phố là bắt buộc.",
            "7. Tỉnh/Thành phố có thể xác định bằng tinhThanhId hoặc maTinhThanh.",
            "8. Nếu nhập đồng thời tinhThanhId và maTinhThanh thì hai giá trị phải thuộc cùng một Tỉnh/Thành phố.",
            "9. Tỉnh/Thành phố phải tồn tại và đang hoạt động.",
            "10. Mã Xã/Phường không được trùng.",
            "11. Tên Xã/Phường không được trùng trong cùng một Tỉnh/Thành phố.",
            "12. Tên viết tắt có thể để trống.",
            "13. active: TRUE = hoạt động; FALSE = khóa.",
            "14. Nếu active để trống khi thêm mới thì mặc định TRUE."
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
        255;


    /* =========================================================
       DÒNG 2: KIỂU DỮ LIỆU
       ========================================================= */

    worksheet
        .getRow(2)
        .values = [

        "Number",

        "Text",

        "Text",

        "Text",

        "Number",

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

        "maXaPhuong/k",

        "tenXaPhuong",

        "tenVietTat",

        "tinhThanhId",

        "maTinhThanh",

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
            "Có giá trị: tìm Xã/Phường theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã Xã/Phường",
            "Có giá trị: tìm Xã/Phường theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên Xã/Phường",
            "Bắt buộc khi thêm mới",
            "Không được trùng trong cùng Tỉnh/Thành phố"
        ].join("\n"),


        [
            "Tên viết tắt",
            "Có thể để trống"
        ].join("\n"),


        [
            "ID Tỉnh/Thành phố",
            "Có thể dùng ID hoặc mã",
            "ID phải là số nguyên lớn hơn 0"
        ].join("\n"),


        [
            "Mã Tỉnh/Thành phố",
            "Có thể dùng thay tinhThanhId",
            "Tỉnh/Thành phố phải đang hoạt động"
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
        120;


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

        "[[dmXaPhuong.id]]",

        "[[dmXaPhuong.maXaPhuong]]",

        "[[dmXaPhuong.tenXaPhuong]]",

        "[[dmXaPhuong.tenVietTat]]",

        "[[dmXaPhuong.tinhThanhId]]",

        "[[dmXaPhuong.maTinhThanh]]",

        "[[dmXaPhuong.active]]"

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
            "G3"

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
           ID XÃ/PHƯỜNG
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
                "ID Xã/Phường không hợp lệ",

            error:
                "ID Xã/Phường phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ID TỈNH/THÀNH PHỐ
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                5
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
                "ID Tỉnh/Thành phố không hợp lệ",

            error:
                "ID Tỉnh/Thành phố phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ACTIVE
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                7
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
            "dm_xa_phuong.xlsx"
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
    