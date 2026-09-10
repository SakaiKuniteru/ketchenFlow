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
            "dm_nhan_vien",
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
                "maNhanVien",

            width:
                24
        },

        {
            key:
                "hoTen",

            width:
                32
        },

        {
            key:
                "ngaySinh",

            width:
                18
        },

        {
            key:
                "gioiTinh",

            width:
                18
        },

        {
            key:
                "soDienThoai",

            width:
                22
        },

        {
            key:
                "email",

            width:
                32
        },

        {
            key:
                "anhDaiDien",

            width:
                40
        },

        {
            key:
                "diaChi",

            width:
                42
        },

        {
            key:
                "ghiChu",

            width:
                40
        },

        {
            key:
                "maThe",

            width:
                24
        },

        {
            key:
                "maQr",

            width:
                28
        },

        {
            key:
                "maBarcode",

            width:
                28
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
                "coSoId",

            width:
                18
        },

        {
            key:
                "maCoSo",

            width:
                20
        },

        {
            key:
                "phongBanId",

            width:
                18
        },

        {
            key:
                "maPhongBan",

            width:
                22
        },

        {
            key:
                "chucVuId",

            width:
                18
        },

        {
            key:
                "maChucVu",

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
        "A1:Z1"
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
            "3. Có id/k: cập nhật nhân viên theo ID.",
            "4. Có maNhanVien/k: cập nhật nhân viên theo mã.",
            "5. Có cả id/k và maNhanVien/k: hệ thống kiểm tra hai khóa phải thuộc cùng một nhân viên.",
            "6. Khi thêm mới: mã nhân viên và họ tên là các thông tin chính cần cung cấp.",
            "7. Ngày sinh nhập theo định dạng YYYY-MM-DD.",
            "8. Số điện thoại và email nếu có phải không được trùng với nhân viên khác.",
            "9. Quốc gia có thể xác định bằng quocGiaId hoặc maQuocGia.",
            "10. Tỉnh/thành có thể xác định bằng tinhThanhId hoặc maTinhThanh.",
            "11. Xã/phường có thể xác định bằng xaPhuongId hoặc maXaPhuong.",
            "12. Tỉnh/thành phải thuộc quốc gia đã chọn.",
            "13. Xã/phường phải thuộc tỉnh/thành đã chọn.",
            "14. Cơ sở có thể xác định bằng coSoId hoặc maCoSo.",
            "15. Phòng ban có thể xác định bằng phongBanId hoặc maPhongBan.",
            "16. Khi dùng mã phòng ban, phòng ban phải thuộc cơ sở đã chọn.",
            "17. Chức vụ có thể xác định bằng chucVuId hoặc maChucVu.",
            "18. Nếu truyền đồng thời ID và mã của cùng một danh mục thì hai giá trị phải khớp nhau.",
            "19. anhDaiDien là đường dẫn ảnh, không phải dữ liệu nhị phân.",
            "20. maThe, maQr, maBarcode, ghiChu và diaChi có thể để trống.",
            "21. active: TRUE = hoạt động; FALSE = khóa."
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
        365;


    /* =========================================================
       DÒNG 2: KIỂU DỮ LIỆU
       ========================================================= */

    worksheet
        .getRow(2)
        .values = [

        "Number",

        "Text",

        "Text",

        "Date",

        "Number",

        "Text",

        "Text",

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

        "maNhanVien/k",

        "hoTen",

        "ngaySinh",

        "gioiTinh",

        "soDienThoai",

        "email",

        "anhDaiDien",

        "diaChi",

        "ghiChu",

        "maThe",

        "maQr",

        "maBarcode",

        "quocGiaId",

        "maQuocGia",

        "tinhThanhId",

        "maTinhThanh",

        "xaPhuongId",

        "maXaPhuong",

        "coSoId",

        "maCoSo",

        "phongBanId",

        "maPhongBan",

        "chucVuId",

        "maChucVu",

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
            "Có giá trị: tìm nhân viên theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa mã nhân viên",
            "Có giá trị: tìm nhân viên theo mã",
            "Không cập nhật mã khi dùng làm khóa"
        ].join("\n"),


        [
            "Họ tên nhân viên",
            "Bắt buộc khi thêm mới"
        ].join("\n"),


        [
            "Ngày sinh",
            "Định dạng YYYY-MM-DD",
            "Ví dụ: 2000-05-20"
        ].join("\n"),


        [
            "Giới tính",
            "Nhập theo enum gioiTinh của hệ thống"
        ].join("\n"),


        [
            "Số điện thoại",
            "Có thể để trống",
            "Không được trùng"
        ].join("\n"),


        [
            "Email",
            "Có thể để trống",
            "Không được trùng"
        ].join("\n"),


        [
            "Đường dẫn ảnh đại diện",
            "Ví dụ: uploads/nhan-vien/avatar.jpg",
            "Có thể để trống"
        ].join("\n"),


        [
            "Địa chỉ chi tiết",
            "Có thể để trống"
        ].join("\n"),


        [
            "Ghi chú",
            "Có thể để trống"
        ].join("\n"),


        [
            "Mã thẻ nhân viên",
            "Có thể để trống"
        ].join("\n"),


        [
            "Mã QR",
            "Có thể để trống"
        ].join("\n"),


        [
            "Mã barcode",
            "Có thể để trống"
        ].join("\n"),


        [
            "ID quốc gia",
            "Có thể dùng ID hoặc mã"
        ].join("\n"),


        [
            "Mã quốc gia",
            "Có thể dùng thay quocGiaId"
        ].join("\n"),


        [
            "ID tỉnh/thành",
            "Phải thuộc quốc gia đã chọn"
        ].join("\n"),


        [
            "Mã tỉnh/thành",
            "Có thể dùng thay tinhThanhId"
        ].join("\n"),


        [
            "ID xã/phường",
            "Phải thuộc tỉnh/thành đã chọn"
        ].join("\n"),


        [
            "Mã xã/phường",
            "Có thể dùng thay xaPhuongId"
        ].join("\n"),


        [
            "ID cơ sở",
            "Có thể dùng ID hoặc mã cơ sở"
        ].join("\n"),


        [
            "Mã cơ sở",
            "Có thể dùng thay coSoId"
        ].join("\n"),


        [
            "ID phòng ban",
            "Phòng ban phải đang hoạt động"
        ].join("\n"),


        [
            "Mã phòng ban",
            "Có thể dùng thay phongBanId",
            "Phải thuộc cơ sở đã chọn"
        ].join("\n"),


        [
            "ID chức vụ",
            "Chức vụ phải đang hoạt động"
        ].join("\n"),


        [
            "Mã chức vụ",
            "Có thể dùng thay chucVuId"
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

        "[[dmNhanVien.id]]",

        "[[dmNhanVien.maNhanVien]]",

        "[[dmNhanVien.hoTen]]",

        "[[dmNhanVien.ngaySinh]]",

        "[[dmNhanVien.gioiTinh]]",

        "[[dmNhanVien.soDienThoai]]",

        "[[dmNhanVien.email]]",

        "[[dmNhanVien.anhDaiDien]]",

        "[[dmNhanVien.diaChi]]",

        "[[dmNhanVien.ghiChu]]",

        "[[dmNhanVien.maThe]]",

        "[[dmNhanVien.maQr]]",

        "[[dmNhanVien.maBarcode]]",

        "[[dmNhanVien.quocGiaId]]",

        "[[dmNhanVien.maQuocGia]]",

        "[[dmNhanVien.tinhThanhId]]",

        "[[dmNhanVien.maTinhThanh]]",

        "[[dmNhanVien.xaPhuongId]]",

        "[[dmNhanVien.maXaPhuong]]",

        "[[dmNhanVien.coSoId]]",

        "[[dmNhanVien.maCoSo]]",

        "[[dmNhanVien.phongBanId]]",

        "[[dmNhanVien.maPhongBan]]",

        "[[dmNhanVien.chucVuId]]",

        "[[dmNhanVien.maChucVu]]",

        "[[dmNhanVien.active]]"

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
            "Z3"

    };


    /* =========================================================
       VALIDATION
       ========================================================= */

    for (
        let rowNumber = 5;
        rowNumber <= 1000;
        rowNumber++
    ) {


        /*
         * Các cột ID:
         *
         * A  = id
         * N  = quocGiaId
         * P  = tinhThanhId
         * R  = xaPhuongId
         * T  = coSoId
         * V  = phongBanId
         * X  = chucVuId
         */

        const idColumns = [
            1,
            14,
            16,
            18,
            20,
            22,
            24
        ];


        for (
            const columnNumber of
            idColumns
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
                    "ID không hợp lệ",

                error:
                    "ID phải là số nguyên lớn hơn 0."

            };

        }


        /* -----------------------------------------------------
           NGÀY SINH
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                4
            )
            .numFmt =
            "yyyy-mm-dd";


        /* -----------------------------------------------------
           ACTIVE
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                26
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
            "dm_nhan_vien.xlsx"
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