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
            "dm_tai_khoan",
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
                "tenDangNhap",

            width:
                28
        },

        {
            key:
                "nhanVienId",

            width:
                20
        },

        {
            key:
                "maNhanVien",

            width:
                24
        },

        {
            key:
                "dsVaiTroId",

            width:
                34
        },

        {
            key:
                "dsMaVaiTro",

            width:
                42
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
            "3. Có id/k: cập nhật tài khoản theo ID.",
            "4. Có tenDangNhap/k: cập nhật tài khoản theo tên đăng nhập.",
            "5. Có cả id/k và tenDangNhap/k: hệ thống phải kiểm tra hai khóa thuộc cùng một tài khoản.",
            "6. Khi thêm mới: tên đăng nhập, nhân viên và ít nhất một vai trò là bắt buộc.",
            "7. Nhân viên có thể xác định bằng nhanVienId hoặc maNhanVien.",
            "8. Một nhân viên chỉ được có một tài khoản.",
            "9. Nếu dùng maNhanVien thì nhân viên phải tồn tại và đang hoạt động.",
            "10. dsVaiTroId là danh sách ID vai trò ngăn cách bằng dấu phẩy. Ví dụ: 1,2,5.",
            "11. dsMaVaiTro là danh sách mã vai trò ngăn cách bằng dấu phẩy. Ví dụ: SUPER_ADMIN,QUAN_LY.",
            "12. Nếu truyền đồng thời dsVaiTroId và dsMaVaiTro thì hai danh sách phải trỏ tới cùng tập vai trò.",
            "13. Phải có ít nhất một vai trò và tất cả vai trò phải đang hoạt động.",
            "14. Không nhập mật khẩu trong file này. Khi tạo mới hệ thống tự dùng mật khẩu mặc định.",
            "15. Đổi mật khẩu và đặt lại mật khẩu thực hiện bằng API riêng.",
            "16. active: TRUE = hoạt động; FALSE = khóa.",
            "17. Nếu active để trống khi thêm mới thì mặc định TRUE."
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
        300;


    /* =========================================================
       DÒNG 2: KIỂU DỮ LIỆU
       ========================================================= */

    worksheet
        .getRow(2)
        .values = [

        "Number",

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

        "tenDangNhap/k",

        "nhanVienId",

        "maNhanVien",

        "dsVaiTroId",

        "dsMaVaiTro",

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
            "Có giá trị: tìm tài khoản theo ID",
            "Không cập nhật ID"
        ].join("\n"),


        [
            "Khóa tên đăng nhập",
            "Có giá trị: tìm tài khoản theo tên đăng nhập",
            "Không cập nhật khi dùng làm khóa"
        ].join("\n"),


        [
            "ID nhân viên",
            "Có thể dùng nhanVienId hoặc maNhanVien",
            "Nhân viên chỉ được có một tài khoản"
        ].join("\n"),


        [
            "Mã nhân viên",
            "Có thể dùng thay nhanVienId",
            "Nhân viên phải tồn tại và đang hoạt động"
        ].join("\n"),


        [
            "Danh sách ID vai trò",
            "Ngăn cách bằng dấu phẩy",
            "Ví dụ: 1,2,5",
            "Phải có ít nhất một vai trò"
        ].join("\n"),


        [
            "Danh sách mã vai trò",
            "Ngăn cách bằng dấu phẩy",
            "Ví dụ: SUPER_ADMIN,QUAN_LY",
            "Có thể dùng thay dsVaiTroId"
        ].join("\n"),


        [
            "Trạng thái tài khoản",
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

        "[[dmTaiKhoan.id]]",

        "[[dmTaiKhoan.tenDangNhap]]",

        "[[dmTaiKhoan.nhanVienId]]",

        "[[dmTaiKhoan.maNhanVien]]",

        "[[dmTaiKhoan.dsVaiTroId]]",

        "[[dmTaiKhoan.dsMaVaiTro]]",

        "[[dmTaiKhoan.active]]"

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
           ID TÀI KHOẢN
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
                "ID tài khoản không hợp lệ",

            error:
                "ID tài khoản phải là số nguyên lớn hơn 0."

        };


        /* -----------------------------------------------------
           ID NHÂN VIÊN
           ----------------------------------------------------- */

        worksheet
            .getCell(
                rowNumber,
                3
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
                "ID nhân viên không hợp lệ",

            error:
                "ID nhân viên phải là số nguyên lớn hơn 0."

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
            "dm_tai_khoan.xlsx"
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