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
            "thuc_don",
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

        /* =========================
           THỰC ĐƠN
           ========================= */

        {
            key:
                "id",

            width:
                14
        },

        {
            key:
                "maThucDon",

            width:
                22
        },

        {
            key:
                "tenThucDon",

            width:
                32
        },

        {
            key:
                "loaiThucDon",

            width:
                20
        },

        {
            key:
                "tuNgay",

            width:
                16
        },

        {
            key:
                "denNgay",

            width:
                16
        },


        /* =========================
           CƠ SỞ
           ========================= */

        {
            key:
                "coSoId",

            width:
                14
        },

        {
            key:
                "maCoSo",

            width:
                18
        },


        /* =========================
           NHÀ ĂN
           ========================= */

        {
            key:
                "nhaAnId",

            width:
                14
        },

        {
            key:
                "maNhaAn",

            width:
                18
        },


        /* =========================
           CA ĂN
           ========================= */

        {
            key:
                "caAnId",

            width:
                14
        },

        {
            key:
                "maCaAn",

            width:
                18
        },


        /* =========================
           THÔNG TIN CHUNG
           ========================= */

        {
            key:
                "trangThai",

            width:
                20
        },

        {
            key:
                "moTa",

            width:
                32
        },

        {
            key:
                "active",

            width:
                18
        },


        /* =========================
           NGÀY THỰC ĐƠN
           ========================= */

        {
            key:
                "thucDonNgayId",

            width:
                18
        },

        {
            key:
                "ngay",

            width:
                16
        },

        {
            key:
                "ghiChuNgay",

            width:
                28
        },

        {
            key:
                "activeNgay",

            width:
                18
        },


        /* =========================
           NHÓM MÓN ĂN
           ========================= */

        {
            key:
                "thucDonNhomMonAnId",

            width:
                24
        },

        {
            key:
                "nhomMonAnId",

            width:
                18
        },

        {
            key:
                "maNhomMonAn",

            width:
                22
        },

        {
            key:
                "thuTuNhom",

            width:
                16
        },

        {
            key:
                "ghiChuNhom",

            width:
                28
        },

        {
            key:
                "activeNhom",

            width:
                18
        },


        /* =========================
           MÓN ĂN
           ========================= */

        {
            key:
                "thucDonMonAnId",

            width:
                20
        },

        {
            key:
                "monAnId",

            width:
                14
        },

        {
            key:
                "maMonAn",

            width:
                18
        },

        {
            key:
                "thuTuMon",

            width:
                16
        },

        {
            key:
                "dinhLuong",

            width:
                16
        },


        /* =========================
           ĐƠN VỊ TÍNH
           ========================= */

        {
            key:
                "donViTinhId",

            width:
                18
        },

        {
            key:
                "maDonViTinh",

            width:
                20
        },


        /* =========================
           THÔNG TIN MÓN
           ========================= */

        {
            key:
                "ghiChuMon",

            width:
                30
        },

        {
            key:
                "activeMon",

            width:
                18
        }

    ];


    /* =========================================================
       DÒNG 1: HƯỚNG DẪN
       ========================================================= */

    worksheet.mergeCells(
        "A1:AH1"
    );


    const huongDan =
        worksheet.getCell(
            "A1"
        );


    huongDan.value =
        [
            "HƯỚNG DẪN IMPORT / EXPORT THỰC ĐƠN:",
            "",
            "1. Không chỉnh sửa dòng 1 đến dòng 5 nếu sử dụng file làm mẫu export.",
            "2. Các trường có hậu tố /k là khóa tìm thực đơn và không được cập nhật.",
            "3. Có id/k: hệ thống tìm thực đơn theo ID.",
            "4. Có maThucDon/k: hệ thống tìm thực đơn theo mã.",
            "5. Có cả id/k và maThucDon/k: hệ thống kiểm tra hai khóa phải thuộc cùng một thực đơn.",
            "6. Khi không tìm thấy thực đơn theo khóa, dữ liệu có thể được dùng để thêm mới.",
            "7. Một thực đơn nhiều ngày / nhiều nhóm / nhiều món sẽ được trải thành nhiều dòng.",
            "8. Các thông tin chung của thực đơn có thể được lặp lại trên nhiều dòng.",
            "9. coSoId hoặc maCoSo dùng để xác định cơ sở.",
            "10. nhaAnId hoặc maNhaAn dùng để xác định nhà ăn.",
            "11. caAnId hoặc maCaAn dùng để xác định ca ăn.",
            "12. nhomMonAnId hoặc maNhomMonAn dùng để xác định nhóm món ăn.",
            "13. monAnId hoặc maMonAn dùng để xác định món ăn.",
            "14. donViTinhId hoặc maDonViTinh dùng để xác định đơn vị tính.",
            "15. Loại thực đơn: 10 = Theo ngày; 20 = Theo tuần; 30 = Theo tháng; 40 = Từ ngày đến ngày.",
            "16. Trạng thái: 10 = Nháp; 20 = Đã duyệt; 30 = Kết thúc; 40 = Hủy.",
            "17. active / activeNgay / activeNhom / activeMon: TRUE = hoạt động; FALSE = khóa.",
            "18. thucDonNgayId, thucDonNhomMonAnId, thucDonMonAnId chủ yếu phục vụ export và đối chiếu dữ liệu chi tiết."
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

        /* A  */ "Number",
        /* B  */ "Text",
        /* C  */ "Text",
        /* D  */ "Number",
        /* E  */ "Date",
        /* F  */ "Date",

        /* G  */ "Number",
        /* H  */ "Text",

        /* I  */ "Number",
        /* J  */ "Text",

        /* K  */ "Number",
        /* L  */ "Text",

        /* M  */ "Number",
        /* N  */ "Text",
        /* O  */ "Boolean",

        /* P  */ "Number",
        /* Q  */ "Date",
        /* R  */ "Text",
        /* S  */ "Boolean",

        /* T  */ "Number",
        /* U  */ "Number",
        /* V  */ "Text",
        /* W  */ "Number",
        /* X  */ "Text",
        /* Y  */ "Boolean",

        /* Z  */ "Number",
        /* AA */ "Number",
        /* AB */ "Text",
        /* AC */ "Number",
        /* AD */ "Number",

        /* AE */ "Number",
        /* AF */ "Text",

        /* AG */ "Text",
        /* AH */ "Boolean"

    ];


    /* =========================================================
       DÒNG 3: FIELD IMPORT
       ========================================================= */

    worksheet
        .getRow(3)
        .values = [

        "id/k",

        "maThucDon/k",

        "tenThucDon",

        "loaiThucDon",

        "tuNgay",

        "denNgay",

        "coSoId",

        "maCoSo",

        "nhaAnId",

        "maNhaAn",

        "caAnId",

        "maCaAn",

        "trangThai",

        "moTa",

        "active",

        "thucDonNgayId",

        "ngay",

        "ghiChuNgay",

        "activeNgay",

        "thucDonNhomMonAnId",

        "nhomMonAnId",

        "maNhomMonAn",

        "thuTuNhom",

        "ghiChuNhom",

        "activeNhom",

        "thucDonMonAnId",

        "monAnId",

        "maMonAn",

        "thuTuMon",

        "dinhLuong",

        "donViTinhId",

        "maDonViTinh",

        "ghiChuMon",

        "activeMon"

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


    worksheet
        .getRow(3)
        .height =
        28;


    /* =========================================================
       DÒNG 4: MÔ TẢ
       ========================================================= */

    worksheet
        .getRow(4)
        .values = [

        /* A */
        [
            "Khóa ID thực đơn",
            "Có giá trị: tìm theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        /* B */
        [
            "Khóa mã thực đơn",
            "Có giá trị: tìm theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        /* C */
        [
            "Tên thực đơn",
            "Bắt buộc khi thêm mới"
        ].join("\n"),


        /* D */
        [
            "Loại thực đơn",
            "10: Theo ngày",
            "20: Theo tuần",
            "30: Theo tháng",
            "40: Từ ngày đến ngày"
        ].join("\n"),


        /* E */
        [
            "Từ ngày",
            "Định dạng YYYY-MM-DD"
        ].join("\n"),


        /* F */
        [
            "Đến ngày",
            "Định dạng YYYY-MM-DD"
        ].join("\n"),


        /* G */
        [
            "ID cơ sở",
            "Có thể dùng ID hoặc mã cơ sở"
        ].join("\n"),


        /* H */
        [
            "Mã cơ sở",
            "Có thể dùng mã hoặc ID cơ sở"
        ].join("\n"),


        /* I */
        [
            "ID nhà ăn",
            "Có thể dùng ID hoặc mã nhà ăn"
        ].join("\n"),


        /* J */
        [
            "Mã nhà ăn",
            "Nhà ăn phải thuộc cơ sở đã chọn"
        ].join("\n"),


        /* K */
        [
            "ID ca ăn",
            "Có thể để trống nếu thực đơn không theo ca"
        ].join("\n"),


        /* L */
        [
            "Mã ca ăn",
            "Có thể dùng thay caAnId"
        ].join("\n"),


        /* M */
        [
            "Trạng thái thực đơn",
            "10: Nháp",
            "20: Đã duyệt",
            "30: Kết thúc",
            "40: Hủy"
        ].join("\n"),


        /* N */
        [
            "Mô tả thực đơn",
            "Có thể để trống"
        ].join("\n"),


        /* O */
        [
            "Trạng thái thực đơn",
            "TRUE: Hoạt động",
            "FALSE: Khóa"
        ].join("\n"),


        /* P */
        [
            "ID chi tiết ngày thực đơn",
            "Phục vụ export / đối chiếu",
            "Không bắt buộc khi import"
        ].join("\n"),


        /* Q */
        [
            "Ngày áp dụng món ăn",
            "Định dạng YYYY-MM-DD",
            "Phải nằm trong từ ngày - đến ngày"
        ].join("\n"),


        /* R */
        [
            "Ghi chú của ngày thực đơn",
            "Có thể để trống"
        ].join("\n"),


        /* S */
        [
            "Trạng thái ngày",
            "TRUE: Hoạt động",
            "FALSE: Khóa"
        ].join("\n"),


        /* T */
        [
            "ID chi tiết nhóm món trong thực đơn",
            "Phục vụ export / đối chiếu",
            "Không bắt buộc khi import"
        ].join("\n"),


        /* U */
        [
            "ID nhóm món ăn",
            "Có thể dùng ID hoặc mã"
        ].join("\n"),


        /* V */
        [
            "Mã nhóm món ăn",
            "Có thể dùng thay nhomMonAnId"
        ].join("\n"),


        /* W */
        [
            "Thứ tự hiển thị nhóm",
            "Số nguyên > 0"
        ].join("\n"),


        /* X */
        [
            "Ghi chú nhóm món",
            "Có thể để trống"
        ].join("\n"),


        /* Y */
        [
            "Trạng thái nhóm món trong thực đơn",
            "TRUE: Hoạt động",
            "FALSE: Khóa"
        ].join("\n"),


        /* Z */
        [
            "ID chi tiết món ăn trong thực đơn",
            "Phục vụ export / đối chiếu",
            "Không bắt buộc khi import"
        ].join("\n"),


        /* AA */
        [
            "ID món ăn",
            "Có thể dùng ID hoặc mã món ăn"
        ].join("\n"),


        /* AB */
        [
            "Mã món ăn",
            "Món phải thuộc nhóm món đã chọn"
        ].join("\n"),


        /* AC */
        [
            "Thứ tự hiển thị món ăn",
            "Số nguyên > 0"
        ].join("\n"),


        /* AD */
        [
            "Định lượng món ăn",
            "Số >= 0",
            "Có thể để trống"
        ].join("\n"),


        /* AE */
        [
            "ID đơn vị tính",
            "Có thể dùng ID hoặc mã"
        ].join("\n"),


        /* AF */
        [
            "Mã đơn vị tính",
            "Có thể dùng thay donViTinhId"
        ].join("\n"),


        /* AG */
        [
            "Ghi chú món ăn",
            "Có thể để trống"
        ].join("\n"),


        /* AH */
        [
            "Trạng thái món ăn trong thực đơn",
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
       =========================================================
       
       Quy ước:
       
       Backend flatten dữ liệu thực đơn thành từng dòng.
       
       Mỗi dòng dùng object:
       
       {
           id,
           maThucDon,
           ...
           ngay,
           nhomMonAnId,
           ...
           monAnId,
           ...
       }
       
       sau đó map vào namespace thucDon.
       ========================================================= */

    worksheet
        .getRow(5)
        .values = [

        "[[thucDon.id]]",

        "[[thucDon.maThucDon]]",

        "[[thucDon.tenThucDon]]",

        "[[thucDon.loaiThucDon]]",

        "[[thucDon.tuNgay]]",

        "[[thucDon.denNgay]]",

        "[[thucDon.coSoId]]",

        "[[thucDon.maCoSo]]",

        "[[thucDon.nhaAnId]]",

        "[[thucDon.maNhaAn]]",

        "[[thucDon.caAnId]]",

        "[[thucDon.maCaAn]]",

        "[[thucDon.trangThai]]",

        "[[thucDon.moTa]]",

        "[[thucDon.active]]",

        "[[thucDon.thucDonNgayId]]",

        "[[thucDon.ngay]]",

        "[[thucDon.ghiChuNgay]]",

        "[[thucDon.activeNgay]]",

        "[[thucDon.thucDonNhomMonAnId]]",

        "[[thucDon.nhomMonAnId]]",

        "[[thucDon.maNhomMonAn]]",

        "[[thucDon.thuTuNhom]]",

        "[[thucDon.ghiChuNhom]]",

        "[[thucDon.activeNhom]]",

        "[[thucDon.thucDonMonAnId]]",

        "[[thucDon.monAnId]]",

        "[[thucDon.maMonAn]]",

        "[[thucDon.thuTuMon]]",

        "[[thucDon.dinhLuong]]",

        "[[thucDon.donViTinhId]]",

        "[[thucDon.maDonViTinh]]",

        "[[thucDon.ghiChuMon]]",

        "[[thucDon.activeMon]]"

    ];


    worksheet
        .getRow(5)
        .height =
        30;


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
       MÀU DÒNG KIỂU DỮ LIỆU
       ========================================================= */

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


    worksheet
        .getRow(2)
        .fill = {

        type:
            "pattern",

        pattern:
            "solid",

        fgColor: {
            argb:
                "FFF3F4F6"
        }

    };


    /* =========================================================
       MÀU KEY EXPORT
       ========================================================= */

    worksheet
        .getRow(5)
        .font = {

        color: {
            argb:
                "FF059669"
        }

    };


    /* =========================================================
       FORMAT NGÀY
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
            .numFmt =
            "yyyy-mm-dd";


        worksheet
            .getCell(
                rowNumber,
                6
            )
            .numFmt =
            "yyyy-mm-dd";


        worksheet
            .getCell(
                rowNumber,
                17
            )
            .numFmt =
            "yyyy-mm-dd";

    }


    /* =========================================================
       VALIDATION LOẠI THỰC ĐƠN
       CỘT D
       ========================================================= */

    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {

        worksheet
            .getCell(
                rowNumber,
                4
            )
            .dataValidation = {

            type:
                "list",

            allowBlank:
                false,

            formulae: [
                '"10,20,30,40"'
            ],

            showErrorMessage:
                true,

            errorTitle:
                "Loại thực đơn không hợp lệ",

            error:
                "Chỉ được nhập 10, 20, 30 hoặc 40."

        };

    }


    /* =========================================================
       VALIDATION TRẠNG THÁI
       CỘT M
       ========================================================= */

    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {

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
                '"10,20,30,40"'
            ],

            showErrorMessage:
                true,

            errorTitle:
                "Trạng thái thực đơn không hợp lệ",

            error:
                "Chỉ được nhập 10, 20, 30 hoặc 40."

        };

    }


    /* =========================================================
       VALIDATION BOOLEAN
       ========================================================= */

    const booleanColumns = [

        15, // active

        19, // activeNgay

        25, // activeNhom

        34  // activeMon

    ];


    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {

        for (
            const columnNumber of
            booleanColumns
        ) {

            worksheet
                .getCell(
                    rowNumber,
                    columnNumber
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

    }


    /* =========================================================
       VALIDATION SỐ DƯƠNG
       ========================================================= */

    const positiveIntegerColumns = [

        1,   // id/k

        7,   // coSoId

        9,   // nhaAnId

        11,  // caAnId

        16,  // thucDonNgayId

        20,  // thucDonNhomMonAnId

        21,  // nhomMonAnId

        23,  // thuTuNhom

        26,  // thucDonMonAnId

        27,  // monAnId

        29,  // thuTuMon

        31   // donViTinhId

    ];


    for (
        let rowNumber = 6;
        rowNumber <= 1000;
        rowNumber++
    ) {

        for (
            const columnNumber of
            positiveIntegerColumns
        ) {

            worksheet
                .getCell(
                    rowNumber,
                    columnNumber
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
                    "Giá trị không hợp lệ",

                error:
                    "Giá trị phải là số nguyên lớn hơn 0."

            };

        }

    }


    /* =========================================================
       VALIDATION ĐỊNH LƯỢNG
       CỘT AD = 30
       ========================================================= */

    for (
        let rowNumber = 6;
        rowNumber <= 1000;
        rowNumber++
    ) {

        worksheet
            .getCell(
                rowNumber,
                30
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
                "Định lượng không hợp lệ",

            error:
                "Định lượng phải lớn hơn hoặc bằng 0."

        };

    }


    /* =========================================================
       AUTO FILTER FIELD
       ========================================================= */

    worksheet.autoFilter = {

        from:
            "A3",

        to:
            "AH3"

    };


    /* =========================================================
       TẠO THƯ MỤC
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
            "thuc_don.xlsx"
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