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
            "dm_kho",
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
                "maKho",

            width:
                22
        },

        {
            key:
                "tenKho",

            width:
                32
        },

        {
            key:
                "nhaAnId",

            width:
                18
        },

        {
            key:
                "maNhaAn",

            width:
                22
        },

        {
            key:
                "loaiKho",

            width:
                20
        },

        {
            key:
                "diaDiem",

            width:
                35
        },

        {
            key:
                "nhietDoToiThieu",

            width:
                22
        },

        {
            key:
                "nhietDoToiDa",

            width:
                22
        },

        {
            key:
                "moTa",

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
            "3. Có id/k: cập nhật kho theo ID.",
            "4. Có maKho/k: cập nhật kho theo mã.",
            "5. Có cả id/k và maKho/k: hệ thống kiểm tra ID và mã phải thuộc cùng một kho.",
            "6. Khi thêm mới: mã kho, tên kho, nhà ăn và loại kho là các thông tin nghiệp vụ cần cung cấp.",
            "7. Nhà ăn có thể xác định bằng nhaAnId hoặc maNhaAn.",
            "8. Nếu truyền đồng thời nhaAnId và maNhaAn thì hai giá trị phải cùng một nhà ăn.",
            "9. Nhà ăn phải tồn tại và đang hoạt động.",
            "10. Nhiệt độ tối thiểu và tối đa có thể để trống.",
            "11. Nếu nhập cả hai nhiệt độ thì nhiệt độ tối thiểu phải nhỏ hơn nhiệt độ tối đa.",
            "12. diaDiem và moTa có thể để trống.",
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
        250;


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

        "maKho/k",

        "tenKho",

        "nhaAnId",

        "maNhaAn",

        "loaiKho",

        "diaDiem",

        "nhietDoToiThieu",

        "nhietDoToiDa",

        "moTa",

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
            "Có giá trị: tìm kho theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã kho",
            "Có giá trị: tìm kho theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Tên kho",
            "Bắt buộc khi thêm mới",
            "Không được trùng"
        ].join("\n"),


        [
            "ID nhà ăn",
            "Có thể dùng nhaAnId hoặc maNhaAn",
            "ID phải là số nguyên > 0"
        ].join("\n"),


        [
            "Mã nhà ăn",
            "Có thể dùng thay nhaAnId",
            "Nhà ăn phải tồn tại và hoạt động"
        ].join("\n"),


        [
            "Loại kho",
            "Giá trị phải thuộc enum loaiKho của hệ thống"
        ].join("\n"),


        [
            "Địa điểm kho",
            "Có thể để trống"
        ].join("\n"),


        [
            "Nhiệt độ tối thiểu",
            "Có thể để trống",
            "Cho phép số âm và số thập phân"
        ].join("\n"),


        [
            "Nhiệt độ tối đa",
            "Có thể để trống",
            "Phải lớn hơn nhiệt độ tối thiểu nếu nhập cả hai"
        ].join("\n"),


        [
            "Mô tả kho",
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
        115;


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

        "[[dmKho.id]]",

        "[[dmKho.maKho]]",

        "[[dmKho.tenKho]]",

        "[[dmKho.nhaAnId]]",

        "[[dmKho.maNhaAn]]",

        "[[dmKho.loaiKho]]",

        "[[dmKho.diaDiem]]",

        "[[dmKho.nhietDoToiThieu]]",

        "[[dmKho.nhietDoToiDa]]",

        "[[dmKho.moTa]]",

        "[[dmKho.active]]"

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
           ID KHO
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
                "ID kho không hợp lệ",

            error:
                "ID kho phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ID NHÀ ĂN
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
                "ID nhà ăn không hợp lệ",

            error:
                "ID nhà ăn phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           NHIỆT ĐỘ TỐI THIỂU
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                8
            )
            .numFmt =
            "0.00";


        /* -----------------------------------------------------
           NHIỆT ĐỘ TỐI ĐA
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                9
            )
            .numFmt =
            "0.00";


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
       VALIDATION NHIỆT ĐỘ
       =========================================================
       
       Nếu cả H và I đều có giá trị:
       H phải nhỏ hơn I.
       
       H = nhietDoToiThieu
       I = nhietDoToiDa
       ========================================================= */

    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {

        worksheet
            .getCell(
                rowNumber,
                9
            )
            .dataValidation = {

            type:
                "custom",

            allowBlank:
                true,

            formulae: [
                `OR(H${rowNumber}="",I${rowNumber}="",H${rowNumber}<I${rowNumber})`
            ],

            showErrorMessage:
                true,

            errorTitle:
                "Khoảng nhiệt độ không hợp lệ",

            error:
                "Nhiệt độ tối thiểu phải nhỏ hơn nhiệt độ tối đa."

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
            "dm_kho.xlsx"
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