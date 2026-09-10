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
            "dm_thiet_lap",
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
                "maThietLap",

            width:
                30
        },

        {
            key:
                "tenThietLap",

            width:
                36
        },

        {
            key:
                "giaTri",

            width:
                35
        },

        {
            key:
                "moTa",

            width:
                42
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
                "dsNhomTinhNangId",

            width:
                40
        },

        {
            key:
                "dsMaNhomTinhNang",

            width:
                52
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
        "A1:J1"
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
            "3. Có id/k: cập nhật thiết lập theo ID.",
            "4. Có maThietLap/k: cập nhật thiết lập theo mã.",
            "5. Có cả id/k và maThietLap/k: hệ thống kiểm tra hai khóa phải thuộc cùng một thiết lập.",
            "6. Khi thêm mới: mã thiết lập, tên thiết lập và ít nhất một nhóm tính năng là bắt buộc.",
            "7. Mã thiết lập được hệ thống chuẩn hóa thành chữ IN HOA.",
            "8. giaTri có thể là chuỗi, số hoặc boolean nhưng khi lưu sẽ được chuyển thành chuỗi.",
            "9. coSoId có thể để trống nếu thiết lập áp dụng toàn hệ thống.",
            "10. maCoSo chỉ phục vụ import/export thuận tiện; khi xử lý cần map về coSoId.",
            "11. dsNhomTinhNangId là danh sách ID nhóm tính năng, ngăn cách bằng dấu phẩy. Ví dụ: 1,2,5.",
            "12. dsMaNhomTinhNang là danh sách mã nhóm tính năng, ngăn cách bằng dấu phẩy.",
            "13. Có thể dùng dsNhomTinhNangId hoặc dsMaNhomTinhNang.",
            "14. Nếu truyền đồng thời hai danh sách thì chúng phải trỏ tới cùng tập nhóm tính năng.",
            "15. Tất cả nhóm tính năng phải tồn tại và đang hoạt động.",
            "16. Khi cập nhật danh sách nhóm tính năng, danh sách mới sẽ thay thế danh sách hiện tại.",
            "17. Mô tả có thể để trống.",
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
        335;


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

        "maThietLap/k",

        "tenThietLap",

        "giaTri",

        "moTa",

        "coSoId",

        "maCoSo",

        "dsNhomTinhNangId",

        "dsMaNhomTinhNang",

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
            "Có giá trị: tìm thiết lập theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã thiết lập",
            "Có giá trị: tìm thiết lập theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên thiết lập",
            "Bắt buộc khi thêm mới"
        ].join("\n"),


        [
            "Giá trị thiết lập",
            "Có thể là Text / Number / Boolean",
            "Khi lưu hệ thống chuyển thành chuỗi"
        ].join("\n"),


        [
            "Mô tả",
            "Có thể để trống"
        ].join("\n"),


        [
            "ID cơ sở",
            "Có thể để trống",
            "Để trống = thiết lập toàn hệ thống"
        ].join("\n"),


        [
            "Mã cơ sở",
            "Có thể dùng để xác định cơ sở khi import",
            "Có thể để trống"
        ].join("\n"),


        [
            "Danh sách ID nhóm tính năng",
            "Ngăn cách bằng dấu phẩy",
            "Ví dụ: 1,2,5",
            "Phải có ít nhất một nhóm"
        ].join("\n"),


        [
            "Danh sách mã nhóm tính năng",
            "Ngăn cách bằng dấu phẩy",
            "Có thể dùng thay dsNhomTinhNangId"
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

        "[[dmThietLap.id]]",

        "[[dmThietLap.maThietLap]]",

        "[[dmThietLap.tenThietLap]]",

        "[[dmThietLap.giaTri]]",

        "[[dmThietLap.moTa]]",

        "[[dmThietLap.coSoId]]",

        "[[dmThietLap.maCoSo]]",

        "[[dmThietLap.dsNhomTinhNangId]]",

        "[[dmThietLap.dsMaNhomTinhNang]]",

        "[[dmThietLap.active]]"

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
            "J3"

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
           ID THIẾT LẬP
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
                "ID thiết lập không hợp lệ",

            error:
                "ID thiết lập phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ID CƠ SỞ
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
                10
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
            "dm_thiet_lap.xlsx"
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