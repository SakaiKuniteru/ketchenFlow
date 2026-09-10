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
            "dm_quyen",
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
                "maQuyen",

            width:
                30
        },

        {
            key:
                "tenQuyen",

            width:
                36
        },

        {
            key:
                "moTa",

            width:
                45
        },

        {
            key:
                "dsNhomTinhNangId",

            width:
                38
        },

        {
            key:
                "dsMaNhomTinhNang",

            width:
                55
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
            "3. Có id/k: cập nhật quyền theo ID.",
            "4. Có maQuyen/k: cập nhật quyền theo mã.",
            "5. Có cả id/k và maQuyen/k: hệ thống kiểm tra ID và mã phải thuộc cùng một quyền.",
            "6. Khi thêm mới: mã quyền, tên quyền và ít nhất một nhóm tính năng là bắt buộc.",
            "7. Mã quyền không được trùng.",
            "8. Tên quyền không được trùng.",
            "9. dsNhomTinhNangId là danh sách ID nhóm tính năng, ngăn cách bằng dấu phẩy. Ví dụ: 1,2,5.",
            "10. dsMaNhomTinhNang là danh sách mã nhóm tính năng, ngăn cách bằng dấu phẩy. Ví dụ: HE_THONG,THUC_DON,BAO_CAO.",
            "11. Có thể dùng dsNhomTinhNangId hoặc dsMaNhomTinhNang.",
            "12. Nếu nhập đồng thời dsNhomTinhNangId và dsMaNhomTinhNang thì hai danh sách phải trỏ tới cùng tập nhóm tính năng.",
            "13. Tất cả nhóm tính năng phải tồn tại và đang hoạt động.",
            "14. Quyền phải có ít nhất một nhóm tính năng.",
            "15. Khi cập nhật danh sách nhóm tính năng, danh sách mới sẽ thay thế danh sách nhóm tính năng hiện tại.",
            "16. Mô tả có thể để trống.",
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
        320;


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

        "maQuyen/k",

        "tenQuyen",

        "moTa",

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
            "Có giá trị: tìm quyền theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã quyền",
            "Có giá trị: tìm quyền theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên quyền",
            "Bắt buộc khi thêm mới",
            "Không được trùng"
        ].join("\n"),


        [
            "Mô tả quyền",
            "Có thể để trống"
        ].join("\n"),


        [
            "Danh sách ID nhóm tính năng",
            "Ngăn cách bằng dấu phẩy",
            "Ví dụ: 1,2,5",
            "Phải có ít nhất một nhóm khi thêm mới"
        ].join("\n"),


        [
            "Danh sách mã nhóm tính năng",
            "Ngăn cách bằng dấu phẩy",
            "Ví dụ: HE_THONG,THUC_DON,BAO_CAO",
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

        "[[dmQuyen.id]]",

        "[[dmQuyen.maQuyen]]",

        "[[dmQuyen.tenQuyen]]",

        "[[dmQuyen.moTa]]",

        "[[dmQuyen.dsNhomTinhNangId]]",

        "[[dmQuyen.dsMaNhomTinhNang]]",

        "[[dmQuyen.active]]"

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
       VALIDATION CHO VÙNG DỮ LIỆU IMPORT
       ========================================================= */

    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {


        /* -----------------------------------------------------
           ID QUYỀN
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
                "ID quyền không hợp lệ",

            error:
                "ID quyền phải là số nguyên lớn hơn 0."

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
            "dm_quyen.xlsx"
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