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
            "dm_quoc_gia",
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
                "maQuocGia",

            width:
                22
        },

        {
            key:
                "tenQuocGia",

            width:
                32
        },

        {
            key:
                "tenTiengAnh",

            width:
                32
        },

        {
            key:
                "maDienThoai",

            width:
                22
        },

        {
            key:
                "tenVietTat",

            width:
                22
        },

        {
            key:
                "maIso2",

            width:
                18
        },

        {
            key:
                "maIso3",

            width:
                18
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
        "A1:I1"
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
            "3. Có id/k: cập nhật quốc gia theo ID.",
            "4. Có maQuocGia/k: cập nhật quốc gia theo mã.",
            "5. Có cả id/k và maQuocGia/k: hệ thống kiểm tra ID và mã phải thuộc cùng một quốc gia.",
            "6. Khi thêm mới: mã quốc gia và tên quốc gia là bắt buộc.",
            "7. Mã quốc gia không được trùng.",
            "8. Tên quốc gia không được trùng.",
            "9. Mã điện thoại nếu có không được trùng.",
            "10. Mã ISO 2 nếu có không được trùng.",
            "11. Mã ISO 3 nếu có không được trùng.",
            "12. tenTiengAnh, maDienThoai, tenVietTat, maIso2 và maIso3 có thể để trống.",
            "13. maIso2 thường có 2 ký tự, ví dụ VN.",
            "14. maIso3 thường có 3 ký tự, ví dụ VNM.",
            "15. active: TRUE = hoạt động; FALSE = khóa.",
            "16. Nếu active để trống khi thêm mới thì mặc định TRUE."
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
        285;


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

        "maQuocGia/k",

        "tenQuocGia",

        "tenTiengAnh",

        "maDienThoai",

        "tenVietTat",

        "maIso2",

        "maIso3",

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
            "Có giá trị: tìm quốc gia theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã quốc gia",
            "Có giá trị: tìm quốc gia theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên quốc gia",
            "Bắt buộc khi thêm mới",
            "Không được trùng"
        ].join("\n"),


        [
            "Tên tiếng Anh",
            "Có thể để trống",
            "Ví dụ: Vietnam"
        ].join("\n"),


        [
            "Mã điện thoại quốc gia",
            "Có thể để trống",
            "Ví dụ: +84",
            "Không được trùng"
        ].join("\n"),


        [
            "Tên viết tắt",
            "Có thể để trống",
            "Ví dụ: Việt Nam"
        ].join("\n"),


        [
            "Mã ISO 2",
            "Có thể để trống",
            "Ví dụ: VN",
            "Không được trùng"
        ].join("\n"),


        [
            "Mã ISO 3",
            "Có thể để trống",
            "Ví dụ: VNM",
            "Không được trùng"
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

        "[[dmQuocGia.id]]",

        "[[dmQuocGia.maQuocGia]]",

        "[[dmQuocGia.tenQuocGia]]",

        "[[dmQuocGia.tenTiengAnh]]",

        "[[dmQuocGia.maDienThoai]]",

        "[[dmQuocGia.tenVietTat]]",

        "[[dmQuocGia.maIso2]]",

        "[[dmQuocGia.maIso3]]",

        "[[dmQuocGia.active]]"

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
            "I3"

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
           ID QUỐC GIA
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
                9
            )
            .dataValidation = {

            type:
                "list",

            allowBlank:
                true,

            formulae: [
                "\"TRUE,FALSE\""
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
            "dm_quoc_gia.xlsx"
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