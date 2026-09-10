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
            "dm_co_so",
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
                "maCoSo",

            width:
                22
        },

        {
            key:
                "tenCoSo",

            width:
                32
        },

        {
            key:
                "diaChi",

            width:
                42
        },

        {
            key:
                "logo",

            width:
                38
        },

        {
            key:
                "favicon",

            width:
                38
        },

        {
            key:
                "logoDoiTac",

            width:
                38
        },

        {
            key:
                "quocGiaId",

            width:
                18
        },

        {
            key:
                "maQuocGia",

            width:
                20
        },

        {
            key:
                "tinhThanhId",

            width:
                18
        },

        {
            key:
                "maTinhThanh",

            width:
                22
        },

        {
            key:
                "xaPhuongId",

            width:
                18
        },

        {
            key:
                "maXaPhuong",

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
        "A1:N1"
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
            "3. Có id/k: cập nhật cơ sở theo ID.",
            "4. Có maCoSo/k: cập nhật cơ sở theo mã.",
            "5. Có cả id/k và maCoSo/k: hệ thống phải kiểm tra ID và mã thuộc cùng một cơ sở.",
            "6. Khi thêm mới: mã cơ sở và tên cơ sở là bắt buộc.",
            "7. Quốc gia có thể xác định bằng quocGiaId hoặc maQuocGia.",
            "8. Tỉnh/thành có thể xác định bằng tinhThanhId hoặc maTinhThanh.",
            "9. Xã/phường có thể xác định bằng xaPhuongId hoặc maXaPhuong.",
            "10. Nếu truyền cả ID và mã của cùng một cấp địa chỉ thì hai giá trị phải khớp nhau.",
            "11. Tỉnh/thành phải thuộc quốc gia đã chọn.",
            "12. Xã/phường phải thuộc tỉnh/thành đã chọn.",
            "13. logo, favicon và logoDoiTac là đường dẫn file hình ảnh, không phải dữ liệu nhị phân.",
            "14. Các trường logo, favicon, logoDoiTac và diaChi có thể để trống.",
            "15. active: TRUE = hoạt động; FALSE = khóa.",
            "16. Khi cập nhật chỉ thay đổi các field được import; khóa /k không được cập nhật."
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

        "Number",

        "Text",

        "Number",

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

        "maCoSo/k",

        "tenCoSo",

        "diaChi",

        "logo",

        "favicon",

        "logoDoiTac",

        "quocGiaId",

        "maQuocGia",

        "tinhThanhId",

        "maTinhThanh",

        "xaPhuongId",

        "maXaPhuong",

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
            "Có giá trị: tìm cơ sở theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã cơ sở",
            "Có giá trị: tìm cơ sở theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên cơ sở",
            "Bắt buộc khi thêm mới",
            "Không được trùng"
        ].join("\n"),


        [
            "Địa chỉ chi tiết",
            "Ví dụ: 123 Nguyễn Văn A",
            "Có thể để trống"
        ].join("\n"),


        [
            "Đường dẫn logo",
            "Ví dụ: uploads/co-so/logo.png",
            "Có thể để trống"
        ].join("\n"),


        [
            "Đường dẫn favicon",
            "Ví dụ: uploads/co-so/favicon.png",
            "Có thể để trống"
        ].join("\n"),


        [
            "Đường dẫn logo đối tác",
            "Có thể để trống"
        ].join("\n"),


        [
            "ID quốc gia",
            "Có thể dùng ID hoặc mã quốc gia"
        ].join("\n"),


        [
            "Mã quốc gia",
            "Ví dụ: VN",
            "Có thể dùng thay quocGiaId"
        ].join("\n"),


        [
            "ID tỉnh/thành",
            "Phải thuộc quốc gia đã chọn"
        ].join("\n"),


        [
            "Mã tỉnh/thành",
            "Có thể dùng thay tinhThanhId",
            "Phải thuộc quốc gia đã chọn"
        ].join("\n"),


        [
            "ID xã/phường",
            "Phải thuộc tỉnh/thành đã chọn"
        ].join("\n"),


        [
            "Mã xã/phường",
            "Có thể dùng thay xaPhuongId",
            "Phải thuộc tỉnh/thành đã chọn"
        ].join("\n"),


        [
            "Trạng thái",
            "TRUE: Hoạt động",
            "FALSE: Khóa"
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

        "[[dmCoSo.id]]",

        "[[dmCoSo.maCoSo]]",

        "[[dmCoSo.tenCoSo]]",

        "[[dmCoSo.diaChi]]",

        "[[dmCoSo.logo]]",

        "[[dmCoSo.favicon]]",

        "[[dmCoSo.logoDoiTac]]",

        "[[dmCoSo.quocGiaId]]",

        "[[dmCoSo.maQuocGia]]",

        "[[dmCoSo.tinhThanhId]]",

        "[[dmCoSo.maTinhThanh]]",

        "[[dmCoSo.xaPhuongId]]",

        "[[dmCoSo.maXaPhuong]]",

        "[[dmCoSo.active]]"

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
            "N3"

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
           ID CƠ SỞ
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
                "ID cơ sở không hợp lệ",

            error:
                "ID cơ sở phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ID QUỐC GIA
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
           ID TỈNH THÀNH
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                10
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
           ID XÃ PHƯỜNG
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                12
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
                "ID xã/phường không hợp lệ",

            error:
                "ID xã/phường phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ACTIVE
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                14
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
            "dm_co_so.xlsx"
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