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
            "dm_mon_an",
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
                "maMonAn",

            width:
                22
        },

        {
            key:
                "tenMonAn",

            width:
                32
        },

        {
            key:
                "nhomMonAnId",

            width:
                20
        },

        {
            key:
                "maNhomMonAn",

            width:
                24
        },

        {
            key:
                "giaTien",

            width:
                20
        },

        {
            key:
                "giaDuKien",

            width:
                20
        },

        {
            key:
                "calories",

            width:
                18
        },

        {
            key:
                "moTa",

            width:
                40
        },

        {
            key:
                "hinhAnh",

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
        "A1:K1"
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
            "3. Có id/k: cập nhật món ăn theo ID.",
            "4. Có maMonAn/k: cập nhật món ăn theo mã.",
            "5. Có cả id/k và maMonAn/k: hệ thống kiểm tra ID và mã phải thuộc cùng một món ăn.",
            "6. Khi thêm mới: mã món ăn, tên món ăn và nhóm món ăn là bắt buộc.",
            "7. Nhóm món ăn có thể xác định bằng nhomMonAnId hoặc maNhomMonAn.",
            "8. Nếu truyền cả nhomMonAnId và maNhomMonAn thì hai giá trị phải cùng một nhóm món ăn.",
            "9. Nhóm món ăn phải tồn tại và đang hoạt động.",
            "10. Giá tiền có thể để trống; nếu có thì phải lớn hơn hoặc bằng 0.",
            "11. Giá dự kiến mặc định bằng 0 và phải lớn hơn hoặc bằng 0.",
            "12. Nếu giá dự kiến lớn hơn 0 thì giá tiền là bắt buộc.",
            "13. Giá tiền phải lớn hơn hoặc bằng giá dự kiến.",
            "14. Calories có thể để trống; nếu có phải là số nguyên lớn hơn hoặc bằng 0.",
            "15. Mô tả và hình ảnh có thể để trống.",
            "16. hinhAnh là đường dẫn file hình ảnh, ví dụ uploads/mon-an/ca-kho.jpg.",
            "17. active: TRUE = hoạt động; FALSE = khóa.",
            "18. Nếu active để trống khi thêm mới thì mặc định TRUE."
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
        315;


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

        "Number",

        "Number",

        "Number",

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

        "maMonAn/k",

        "tenMonAn",

        "nhomMonAnId",

        "maNhomMonAn",

        "giaTien",

        "giaDuKien",

        "calories",

        "moTa",

        "hinhAnh",

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
            "Có giá trị: tìm món ăn theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã món ăn",
            "Có giá trị: tìm món ăn theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên món ăn",
            "Bắt buộc khi thêm mới",
            "Không được trùng trong cùng nhóm món ăn"
        ].join("\n"),


        [
            "ID nhóm món ăn",
            "Có thể dùng ID hoặc mã nhóm",
            "ID phải là số nguyên > 0"
        ].join("\n"),


        [
            "Mã nhóm món ăn",
            "Có thể dùng thay nhomMonAnId",
            "Nhóm phải tồn tại và đang hoạt động"
        ].join("\n"),


        [
            "Giá tiền",
            "Có thể để trống",
            "Nếu có phải >= 0",
            "Phải >= giá dự kiến"
        ].join("\n"),


        [
            "Giá dự kiến",
            "Mặc định 0",
            "Phải >= 0",
            "Nếu > 0 thì giá tiền bắt buộc"
        ].join("\n"),


        [
            "Calories",
            "Có thể để trống",
            "Phải là số nguyên >= 0"
        ].join("\n"),


        [
            "Mô tả món ăn",
            "Có thể để trống"
        ].join("\n"),


        [
            "Đường dẫn hình ảnh",
            "Ví dụ: uploads/mon-an/ca-kho.jpg",
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
        125;


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

        "[[dmMonAn.id]]",

        "[[dmMonAn.maMonAn]]",

        "[[dmMonAn.tenMonAn]]",

        "[[dmMonAn.nhomMonAnId]]",

        "[[dmMonAn.maNhomMonAn]]",

        "[[dmMonAn.giaTien]]",

        "[[dmMonAn.giaDuKien]]",

        "[[dmMonAn.calories]]",

        "[[dmMonAn.moTa]]",

        "[[dmMonAn.hinhAnh]]",

        "[[dmMonAn.active]]"

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
            "K3"

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
           ID MÓN ĂN
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
                "ID món ăn không hợp lệ",

            error:
                "ID món ăn phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ID NHÓM MÓN ĂN
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
                "ID nhóm món ăn không hợp lệ",

            error:
                "ID nhóm món ăn phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           GIÁ TIỀN
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                6
            )
            .dataValidation = {

            type:
                "decimal",

            operator:
                "greaterThanOrEqual",

            allowBlank:
                true,

            formulae: [
                0
            ],

            showErrorMessage:
                true,

            errorTitle:
                "Giá tiền không hợp lệ",

            error:
                "Giá tiền phải lớn hơn hoặc bằng 0."

        };


        worksheet
            .getCell(
                rowNumber,
                6
            )
            .numFmt =
            "#,##0.00";


        /* -----------------------------------------------------
           GIÁ DỰ KIẾN
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                7
            )
            .dataValidation = {

            type:
                "decimal",

            operator:
                "greaterThanOrEqual",

            allowBlank:
                true,

            formulae: [
                0
            ],

            showErrorMessage:
                true,

            errorTitle:
                "Giá dự kiến không hợp lệ",

            error:
                "Giá dự kiến phải lớn hơn hoặc bằng 0."

        };


        worksheet
            .getCell(
                rowNumber,
                7
            )
            .numFmt =
            "#,##0.00";


        /* -----------------------------------------------------
           CALORIES
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                8
            )
            .dataValidation = {

            type:
                "whole",

            operator:
                "greaterThanOrEqual",

            allowBlank:
                true,

            formulae: [
                0
            ],

            showErrorMessage:
                true,

            errorTitle:
                "Calories không hợp lệ",

            error:
                "Calories phải là số nguyên lớn hơn hoặc bằng 0."

        };


        /* -----------------------------------------------------
           ACTIVE
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                11
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
       VALIDATION LIÊN QUAN GIÁ
       =========================================================
       
       F = giaTien
       G = giaDuKien

       Điều kiện:
       - nếu G > 0 thì F không được trống
       - nếu F có giá trị thì F >= G
       ========================================================= */

    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {

        worksheet
            .getCell(
                rowNumber,
                6
            )
            .dataValidation = {

            type:
                "custom",

            allowBlank:
                true,

            formulae: [
                `OR(G${rowNumber}="",G${rowNumber}=0,AND(F${rowNumber}<>"",F${rowNumber}>=G${rowNumber}))`
            ],

            showErrorMessage:
                true,

            errorTitle:
                "Giá món ăn không hợp lệ",

            error:
                "Nếu giá dự kiến lớn hơn 0 thì phải nhập giá tiền và giá tiền phải lớn hơn hoặc bằng giá dự kiến."

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
            "dm_mon_an.xlsx"
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