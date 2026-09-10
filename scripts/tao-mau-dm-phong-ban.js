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
            "dm_phong_ban",
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
                "maPhongBan",

            width:
                24
        },

        {
            key:
                "tenPhongBan",

            width:
                32
        },

        {
            key:
                "moTa",

            width:
                40
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
            "3. Có id/k: cập nhật phòng ban theo ID.",
            "4. Có maPhongBan/k: cập nhật phòng ban theo mã.",
            "5. Có cả id/k và maPhongBan/k: hệ thống kiểm tra ID và mã phải thuộc cùng một phòng ban.",
            "6. Khi thêm mới: mã phòng ban và tên phòng ban là bắt buộc.",
            "7. Cơ sở có thể xác định bằng coSoId hoặc maCoSo.",
            "8. Nếu truyền đồng thời coSoId và maCoSo thì hai giá trị phải cùng một cơ sở.",
            "9. Cơ sở phải tồn tại và đang hoạt động.",
            "10. active: TRUE = hoạt động; FALSE = khóa."
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

        wrapText:
            true

    };


    worksheet
        .getRow(1)
        .height =
        190;


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
            true

    };


    /* =========================================================
       DÒNG 3: FIELD IMPORT
       ========================================================= */

    worksheet
        .getRow(3)
        .values = [

        "id/k",

        "maPhongBan/k",

        "tenPhongBan",

        "moTa",

        "coSoId",

        "maCoSo",

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
       DÒNG 4: MÔ TẢ FIELD
       ========================================================= */

    worksheet
        .getRow(4)
        .values = [

        [
            "Khóa ID",
            "Có giá trị: tìm phòng ban theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã phòng ban",
            "Có giá trị: tìm phòng ban theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên phòng ban",
            "Bắt buộc khi thêm mới",
            "Không được trùng trong cùng cơ sở"
        ].join("\n"),


        [
            "Mô tả phòng ban",
            "Có thể để trống"
        ].join("\n"),


        [
            "ID cơ sở",
            "Có thể dùng coSoId hoặc maCoSo",
            "Cơ sở phải đang hoạt động"
        ].join("\n"),


        [
            "Mã cơ sở",
            "Có thể dùng maCoSo hoặc coSoId",
            "Nếu có cả ID và mã thì phải khớp nhau"
        ].join("\n"),


        [
            "Trạng thái",
            "TRUE: Hoạt động",
            "FALSE: Khóa",
            "Để trống mặc định TRUE khi thêm mới"
        ].join("\n")

    ];


    worksheet
        .getRow(4)
        .height =
        105;


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

        "[[dmPhongBan.id]]",

        "[[dmPhongBan.maPhongBan]]",

        "[[dmPhongBan.tenPhongBan]]",

        "[[dmPhongBan.moTa]]",

        "[[dmPhongBan.coSoId]]",

        "[[dmPhongBan.maCoSo]]",

        "[[dmPhongBan.active]]"

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
       STYLE DÒNG 2 → DÒNG 5
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
       VALIDATION DỮ LIỆU
       ========================================================= */

    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {


        /* -----------------------------------------------------
           ID phòng ban
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
                "ID không hợp lệ",

            error:
                "ID phòng ban phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ID cơ sở
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
       THƯ MỤC OUTPUT
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
       GHI FILE
       ========================================================= */

    const outputPath =
        path.join(
            outputDirectory,
            "dm_phong_ban.xlsx"
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