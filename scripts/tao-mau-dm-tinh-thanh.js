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
            "dm_tinh_thanh",
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
                "maTinhThanh",

            width:
                26
        },

        {
            key:
                "tenTinhThanh",

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
                "quocGiaId",

            width:
                20
        },

        {
            key:
                "maQuocGia",

            width:
                22
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
            "3. Có id/k: cập nhật tỉnh/thành theo ID.",
            "4. Có maTinhThanh/k: cập nhật tỉnh/thành theo mã.",
            "5. Có cả id/k và maTinhThanh/k: hệ thống kiểm tra ID và mã phải thuộc cùng một tỉnh/thành.",
            "6. Khi thêm mới: mã tỉnh/thành, tên tỉnh/thành và quốc gia là bắt buộc.",
            "7. Quốc gia có thể xác định bằng quocGiaId hoặc maQuocGia.",
            "8. Nếu nhập đồng thời quocGiaId và maQuocGia thì hai giá trị phải thuộc cùng một quốc gia.",
            "9. Quốc gia phải tồn tại và đang hoạt động.",
            "10. Mã tỉnh/thành không được trùng.",
            "11. Tên tỉnh/thành không được trùng trong cùng một quốc gia.",
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

        "maTinhThanh/k",

        "tenTinhThanh",

        "tenVietTat",

        "quocGiaId",

        "maQuocGia",

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
            "Có giá trị: tìm tỉnh/thành theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã tỉnh/thành",
            "Có giá trị: tìm tỉnh/thành theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên tỉnh/thành",
            "Bắt buộc khi thêm mới",
            "Không được trùng trong cùng quốc gia"
        ].join("\n"),


        [
            "Tên viết tắt",
            "Có thể để trống",
            "Ví dụ: HN, HCM"
        ].join("\n"),


        [
            "ID quốc gia",
            "Có thể dùng ID hoặc mã quốc gia",
            "ID phải là số nguyên lớn hơn 0"
        ].join("\n"),


        [
            "Mã quốc gia",
            "Có thể dùng thay quocGiaId",
            "Ví dụ: VN",
            "Quốc gia phải đang hoạt động"
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

        "[[dmTinhThanh.id]]",

        "[[dmTinhThanh.maTinhThanh]]",

        "[[dmTinhThanh.tenTinhThanh]]",

        "[[dmTinhThanh.tenVietTat]]",

        "[[dmTinhThanh.quocGiaId]]",

        "[[dmTinhThanh.maQuocGia]]",

        "[[dmTinhThanh.active]]"

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
           ID TỈNH THÀNH
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
                "ID tỉnh/thành không hợp lệ",

            error:
                "ID tỉnh/thành phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ID QUỐC GIA
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
                "ID quốc gia không hợp lệ",

            error:
                "ID quốc gia phải là số nguyên lớn hơn 0."

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
            "dm_tinh_thanh.xlsx"
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