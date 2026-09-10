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
            "dm_thuc_pham",
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
                "maThucPham",

            width:
                24
        },

        {
            key:
                "tenThucPham",

            width:
                32
        },

        {
            key:
                "donViSoCapId",

            width:
                20
        },

        {
            key:
                "maDonViSoCap",

            width:
                24
        },

        {
            key:
                "donViSuDungId",

            width:
                20
        },

        {
            key:
                "maDonViSuDung",

            width:
                24
        },

        {
            key:
                "heSoQuyDoi",

            width:
                20
        },

        {
            key:
                "quyCach",

            width:
                32
        },

        {
            key:
                "giaNhap",

            width:
                22
        },

        {
            key:
                "tyLeHaoHutDuKien",

            width:
                25
        },

        {
            key:
                "ghiChu",

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
        "A1:M1"
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
            "3. Có id/k: cập nhật thực phẩm theo ID.",
            "4. Có maThucPham/k: cập nhật thực phẩm theo mã.",
            "5. Có cả id/k và maThucPham/k: hệ thống kiểm tra ID và mã phải thuộc cùng một thực phẩm.",
            "6. Khi thêm mới: mã thực phẩm, tên thực phẩm, đơn vị sơ cấp và đơn vị sử dụng là bắt buộc.",
            "7. Đơn vị sơ cấp có thể xác định bằng donViSoCapId hoặc maDonViSoCap.",
            "8. Đơn vị sử dụng có thể xác định bằng donViSuDungId hoặc maDonViSuDung.",
            "9. Nếu truyền cả ID và mã của cùng một đơn vị thì hai giá trị phải khớp nhau.",
            "10. Đơn vị sơ cấp và đơn vị sử dụng phải cùng loại đơn vị.",
            "11. Hệ số quy đổi phải lớn hơn 0.",
            "12. Nếu đơn vị sơ cấp và đơn vị sử dụng giống nhau thì hệ số quy đổi phải bằng 1.",
            "13. Nếu không nhập hệ số quy đổi khi thêm mới thì mặc định bằng 1.",
            "14. Quy cách có thể để trống; hệ thống có thể tự sinh theo đơn vị và hệ số quy đổi.",
            "15. Giá nhập phải lớn hơn hoặc bằng 0 và có thể để trống.",
            "16. Tỷ lệ hao hụt dự kiến phải từ 0 đến 100; để trống khi thêm mới mặc định 0.",
            "17. Ghi chú có thể để trống.",
            "18. active: TRUE = hoạt động; FALSE = khóa.",
            "19. Nếu active để trống khi thêm mới thì mặc định TRUE."
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
        330;


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

        "Text",

        "Number",

        "Text",

        "Number",

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

        "maThucPham/k",

        "tenThucPham",

        "donViSoCapId",

        "maDonViSoCap",

        "donViSuDungId",

        "maDonViSuDung",

        "heSoQuyDoi",

        "quyCach",

        "giaNhap",

        "tyLeHaoHutDuKien",

        "ghiChu",

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
            "Có giá trị: tìm thực phẩm theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã thực phẩm",
            "Có giá trị: tìm thực phẩm theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên thực phẩm",
            "Bắt buộc khi thêm mới",
            "Không được trùng"
        ].join("\n"),


        [
            "ID đơn vị sơ cấp",
            "Có thể dùng ID hoặc mã",
            "Đơn vị phải tồn tại và hoạt động"
        ].join("\n"),


        [
            "Mã đơn vị sơ cấp",
            "Có thể dùng thay donViSoCapId"
        ].join("\n"),


        [
            "ID đơn vị sử dụng",
            "Có thể dùng ID hoặc mã",
            "Phải cùng loại với đơn vị sơ cấp"
        ].join("\n"),


        [
            "Mã đơn vị sử dụng",
            "Có thể dùng thay donViSuDungId"
        ].join("\n"),


        [
            "Hệ số quy đổi",
            "Phải > 0",
            "Ví dụ: 1 kg = 1000 g thì nhập 1000",
            "Nếu hai đơn vị giống nhau phải bằng 1"
        ].join("\n"),


        [
            "Quy cách",
            "Có thể để trống",
            "Ví dụ: 1 kg = 1000 g",
            "Hệ thống có thể tự tạo"
        ].join("\n"),


        [
            "Giá nhập",
            "Phải >= 0",
            "Có thể để trống"
        ].join("\n"),


        [
            "Tỷ lệ hao hụt dự kiến (%)",
            "Từ 0 đến 100",
            "Để trống mặc định 0"
        ].join("\n"),


        [
            "Ghi chú",
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
        130;


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

        "[[dmThucPham.id]]",

        "[[dmThucPham.maThucPham]]",

        "[[dmThucPham.tenThucPham]]",

        "[[dmThucPham.donViSoCapId]]",

        "[[dmThucPham.maDonViSoCap]]",

        "[[dmThucPham.donViSuDungId]]",

        "[[dmThucPham.maDonViSuDung]]",

        "[[dmThucPham.heSoQuyDoi]]",

        "[[dmThucPham.quyCach]]",

        "[[dmThucPham.giaNhap]]",

        "[[dmThucPham.tyLeHaoHutDuKien]]",

        "[[dmThucPham.ghiChu]]",

        "[[dmThucPham.active]]"

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
            "M3"

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
           ID THỰC PHẨM
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
                "ID thực phẩm không hợp lệ",

            error:
                "ID thực phẩm phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ID ĐƠN VỊ SƠ CẤP
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
                "ID đơn vị sơ cấp không hợp lệ",

            error:
                "ID đơn vị sơ cấp phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ID ĐƠN VỊ SỬ DỤNG
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                6
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
                "ID đơn vị sử dụng không hợp lệ",

            error:
                "ID đơn vị sử dụng phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           HỆ SỐ QUY ĐỔI
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                8
            )
            .dataValidation = {

            type:
                "decimal",

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
                "Hệ số quy đổi không hợp lệ",

            error:
                "Hệ số quy đổi phải là số lớn hơn 0."

        };


        worksheet
            .getCell(
                rowNumber,
                8
            )
            .numFmt =
            "0.000";


        /* -----------------------------------------------------
           GIÁ NHẬP
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                10
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
                "Giá nhập không hợp lệ",

            error:
                "Giá nhập phải lớn hơn hoặc bằng 0."

        };


        worksheet
            .getCell(
                rowNumber,
                10
            )
            .numFmt =
            "#,##0.00";


        /* -----------------------------------------------------
           TỶ LỆ HAO HỤT
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                11
            )
            .dataValidation = {

            type:
                "decimal",

            operator:
                "between",

            allowBlank:
                true,

            formulae: [
                0,
                100
            ],

            showErrorMessage:
                true,

            errorTitle:
                "Tỷ lệ hao hụt không hợp lệ",

            error:
                "Tỷ lệ hao hụt dự kiến phải nằm trong khoảng từ 0 đến 100."

        };


        worksheet
            .getCell(
                rowNumber,
                11
            )
            .numFmt =
            "0.00";


        /* -----------------------------------------------------
           ACTIVE
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                13
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
            "dm_thuc_pham.xlsx"
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