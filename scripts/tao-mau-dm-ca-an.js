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
            "dm_ca_an",
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
                "maCaAn",

            width:
                24
        },

        {
            key:
                "tenCaAn",

            width:
                32
        },

        {
            key:
                "thoiGianBatDau",

            width:
                24
        },

        {
            key:
                "thoiGianKetThuc",

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
        "A1:F1"
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
            "3. Có id/k: cập nhật ca ăn theo ID.",
            "4. Có maCaAn/k: cập nhật ca ăn theo mã.",
            "5. Có cả id/k và maCaAn/k: hệ thống kiểm tra ID và mã phải thuộc cùng một ca ăn.",
            "6. Khi thêm mới: mã ca ăn, tên ca ăn, thời gian bắt đầu và thời gian kết thúc là bắt buộc.",
            "7. Thời gian phải có định dạng HH:mm hoặc HH:mm:ss.",
            "8. Ví dụ hợp lệ: 06:30, 11:00, 17:30:00.",
            "9. Thời gian kết thúc phải lớn hơn thời gian bắt đầu.",
            "10. Mã ca ăn không được trùng.",
            "11. Tên ca ăn không được trùng.",
            "12. active: TRUE = hoạt động; FALSE = khóa.",
            "13. Nếu active để trống khi thêm mới thì mặc định TRUE."
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
        235;


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

        "maCaAn/k",

        "tenCaAn",

        "thoiGianBatDau",

        "thoiGianKetThuc",

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
            "Có giá trị: tìm ca ăn theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã ca ăn",
            "Có giá trị: tìm ca ăn theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên ca ăn",
            "Bắt buộc khi thêm mới",
            "Không được trùng"
        ].join("\n"),


        [
            "Thời gian bắt đầu",
            "Bắt buộc khi thêm mới",
            "Định dạng HH:mm hoặc HH:mm:ss",
            "Ví dụ: 11:00"
        ].join("\n"),


        [
            "Thời gian kết thúc",
            "Bắt buộc khi thêm mới",
            "Phải lớn hơn thời gian bắt đầu",
            "Ví dụ: 13:30"
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
        110;


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

        "[[dmCaAn.id]]",

        "[[dmCaAn.maCaAn]]",

        "[[dmCaAn.tenCaAn]]",

        "[[dmCaAn.thoiGianBatDau]]",

        "[[dmCaAn.thoiGianKetThuc]]",

        "[[dmCaAn.active]]"

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
            "F3"

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
           ID CA ĂN
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
                "ID ca ăn không hợp lệ",

            error:
                "ID ca ăn phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           THỜI GIAN BẮT ĐẦU
           -----------------------------------------------------
           
           Dùng Text thay vì Excel Time để lúc import
           nhận đúng chuỗi HH:mm.
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                4
            )
            .numFmt =
            "@";


        /* -----------------------------------------------------
           THỜI GIAN KẾT THÚC
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                5
            )
            .numFmt =
            "@";


        /* -----------------------------------------------------
           ACTIVE
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                6
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
       GỢI Ý VALIDATION THỜI GIAN
       =========================================================
       
       D = thời gian bắt đầu
       E = thời gian kết thúc

       Không ép công thức Excel quá phức tạp ở đây vì BE
       của bạn đã validate chính xác HH:mm / HH:mm:ss.
       
       Tuy nhiên vẫn thêm cảnh báo logic kết thúc > bắt đầu
       cho trường hợp nhập HH:mm.
       ========================================================= */

    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {

        worksheet
            .getCell(
                rowNumber,
                5
            )
            .dataValidation = {

            type:
                "custom",

            allowBlank:
                true,

            formulae: [
                `OR(D${rowNumber}="",E${rowNumber}="",TIMEVALUE(E${rowNumber})>TIMEVALUE(D${rowNumber}))`
            ],

            showErrorMessage:
                true,

            errorTitle:
                "Thời gian ca ăn không hợp lệ",

            error:
                "Thời gian kết thúc phải lớn hơn thời gian bắt đầu."

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
            "dm_ca_an.xlsx"
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