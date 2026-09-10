"use strict";

const { renderPage } = require("../utils/render-page.util");

function textColumn(key, label, options = {}) {
    return {
        key,
        label,
        sortable: options.sortable !== false,
        searchable: options.searchable !== false,
        filterable: options.filterable !== false,
        isBoolean: false,
        className: options.className || (options.center === true ? "catalog-table__cell--center" : ""),
        width: options.width || "",
        ...(options.format ? { format: options.format } : {})
    };
}

function booleanColumn(key = "active", label = "Hiệu lực", options = {}) {
    return {
        key,
        label,
        sortable: options.sortable !== false,
        searchable: false,
        filterable: options.filterable !== false,
        isBoolean: true,
        type: "boolean",
        trueLabel: options.trueLabel || "TRUE",
        falseLabel: options.falseLabel || "FALSE",
        filterId: `catalogFilter_${key}`,
        filterName: `catalogFilter_${key}`,
        filterOptions: [
            {
                value: "true",
                label: options.trueLabel || "TRUE"
            },
            {
                value: "false",
                label: options.falseLabel || "FALSE"
            }
        ],
        className: options.className || (options.center === false ? "" : "catalog-table__cell--center"),
        width: options.width || "140px"
    };
}

function numberColumn(key, label, options = {}) {
    return {
        key,
        label,
        sortable: options.sortable !== false,
        searchable: options.searchable === true,
        filterable: options.filterable !== false,
        isBoolean: false,
        type: "number",
        className: options.className || "catalog-table__cell--right",
        width: options.width || "130px"
    };
}

function renderDanhMuc(req, res, config) {
    return renderPage(req, res, config.view, 
        {
            title: config.title,
            pageDescription: config.description || "",
            isCatalogPage: true,
            activeMenu: config.activeMenu || "danh-muc",
            activeSubmenu: config.activeSubmenu,
            breadcrumbs: config.breadcrumbs || [
                {
                    label: config.page
                }
            ],
            columns: config.columns || [],
            showActions: config.showActions !== false,
            showIndex: config.showIndex !== false,
            showFilterRow: config.showFilterRow !== false,
            selectable: config.selectable === true,
            searchPlaceholder: config.searchPlaceholder || "Tìm theo mã hoặc tên...",
            hideCreateButton: config.hideCreateButton === true,
            showExportButton: config.showExportButton === true,
            formOptions: {
                ...(res.locals.formOptions || {}),
                ...(config.formOptions || {})
            }
        }
    );
}

class DanhMucWebController {
    async coSo(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/to-chuc/co-so/index",
                title: "Danh mục cơ sở",
                description: "Quản lý danh sách cơ sở trong hệ thống.",
                page: "Cơ sở",
                activeSubmenu: "co-so",
                searchPlaceholder: "Tìm theo mã, tên hoặc địa chỉ...",
                columns: [
                    textColumn("maCoSo", "Mã cơ sở", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("tenCoSo", "Tên cơ sở", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("diaChi", "Địa chỉ", { className: "catalog-table__cell--center"}),
                    textColumn("tenQuocGia", "Quốc gia", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("tenTinhThanh", "Tỉnh/Thành", { width: "180px", className: "catalog-table__cell--center" }),
                    textColumn("tenXaPhuong", "Xã/Phường", { width: "180px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async phongBan(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/to-chuc/phong-ban/index",
                title: "Danh mục phòng ban",
                description: "Quản lý phòng ban theo từng cơ sở.",
                page: "Phòng ban",
                activeSubmenu: "phong-ban",
                searchPlaceholder: "Tìm theo mã hoặc tên phòng ban...",
                columns: [
                    textColumn("maPhongBan", "Mã phòng ban", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("tenPhongBan", "Tên phòng ban", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("tenCoSo", "Cơ sở", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("moTa", "Mô tả", { width: "250px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async chucVu(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/to-chuc/chuc-vu/index",
                title: "Danh mục chức vụ",
                description: "Quản lý các chức vụ của nhân viên.",
                page: "Chức vụ",
                activeSubmenu: "chuc-vu",
                columns: [
                    textColumn("maChucVu", "Mã chức vụ", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("tenChucVu", "Tên chức vụ", { width: "240px", className: "catalog-table__cell--center" }),
                    textColumn("moTa", "Mô tả", { width: "250px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async nhaAn(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/to-chuc/nha-an/index",
                title: "Danh mục nhà ăn",
                description: "Quản lý danh sách nhà ăn theo cơ sở.",
                page: "Nhà ăn",
                activeSubmenu: "nha-an",
                columns: [
                    textColumn("maNhaAn", "Mã nhà ăn", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("tenNhaAn", "Tên nhà ăn", { className: "catalog-table__cell--center"}),
                    textColumn("tenCoSo", "Cơ sở", { width: "210px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async kho(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/to-chuc/kho/index",
                title: "Danh mục kho",
                description: "Quản lý kho theo từng nhà ăn.",
                page: "Kho",
                activeSubmenu: "kho",
                columns: [
                    textColumn("maKho", "Mã kho", { width: "140px", className: "catalog-table__cell--center" }),
                    textColumn("tenKho", "Tên kho", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("tenNhaAn", "Nhà ăn", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("loaiKhoText", "Loại kho", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("diaDiem", "Địa điểm", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("dienTich", "Diện tích", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("nhietDoToiThieu", "Nhiệt độ tối thiếu", { width: "140px", className: "catalog-table__cell--center" }),
                    textColumn("nhietDoToiDa", "Nhiệt độ tối đa", { width: "140px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async diaChiHanhChinh(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/dia-chi-hanh-chinh/tong-hop/index",
                title: "Tổng hợp địa chỉ hành chính",
                description: "Tra cứu tổng hợp quốc gia, tỉnh thành và xã phường.",
                page: "Tổng hợp",
                activeSubmenu: "tong-hop-dia-chi",
                hideCreateButton: true,
                columns: [
                    textColumn("maDiaChi", "Mã địa chỉ", { width: "140px", className: "catalog-table__cell--center" }),
                    textColumn("tenDiaChi", "Tên địa chỉ", { className: "catalog-table__cell--center"}),
                    textColumn("tenQuocGia", "Tên quốc gia", { width: "180px", className: "catalog-table__cell--center" }),
                    textColumn("tenTiengAnh", "Tên tiếng Anh", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("quocGiaTenVietTat", "Tên viết tắt QG", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("maIso2", "ISO2", { width: "90px", className: "catalog-table__cell--center" }),
                    textColumn("maIso3", "ISO3", { width: "90px", className: "catalog-table__cell--center" }),
                    textColumn("tenTinhThanh", "Tên Tỉnh/TP", { width: "190px", className: "catalog-table__cell--center" }),
                    textColumn("tinhThanhTenVietTat", "Tên viết tắt Tỉnh/TP", { width: "190px", className: "catalog-table__cell--center" }),
                    textColumn("tenXaPhuong", "Tên Xã/Phường", { width: "190px", className: "catalog-table__cell--center" }),
                    textColumn("xaPhuongTenVietTat", "Tên viết tắt Xã/Phường", { width: "190px", className: "catalog-table__cell--center" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async quocGia(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/dia-chi-hanh-chinh/quoc-gia/index",
                title: "Danh mục quốc gia",
                description: "Quản lý danh sách quốc gia.",
                page: "Quốc gia",
                activeSubmenu: "quoc-gia",
                columns: [
                    textColumn("maQuocGia", "Mã quốc gia", { width: "140px", className: "catalog-table__cell--center" }),
                    textColumn("tenQuocGia", "Tên quốc gia", { className: "catalog-table__cell--center"}),
                    textColumn("tenTiengAnh", "Tên tiếng Anh", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("tenVietTat", "Tên viết tắt", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("maIso2", "ISO2", { width: "85px", className: "catalog-table__cell--center" }),
                    textColumn("maIso3", "ISO3", { width: "85px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" })
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async tinhThanh(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/dia-chi-hanh-chinh/tinh-thanh/index",
                title: "Danh mục tỉnh thành",
                description: "Quản lý tỉnh thành theo quốc gia.",
                page: "Tỉnh thành",
                activeSubmenu: "tinh-thanh",
                columns: [
                    textColumn("maTinhThanh", "Mã tỉnh thành", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("tenTinhThanh", "Tên tỉnh thành", { className: "catalog-table__cell--center"}),
                    textColumn("tenVietTat", "Tên viết tắt", { className: "catalog-table__cell--center"}),
                    textColumn("tenQuocGia", "Quốc gia", { className: "catalog-table__cell--center"}),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async xaPhuong(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/dia-chi-hanh-chinh/xa-phuong/index",
                title: "Danh mục xã phường",
                description: "Quản lý xã phường theo tỉnh thành.",
                page: "Xã phường",
                activeSubmenu: "xa-phuong",
                columns: [
                    textColumn("maXaPhuong", "Mã xã phường", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("tenXaPhuong", "Tên xã phường", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("tenVietTat", "Tên viết tắt", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("tenTinhThanh", "Tỉnh thành", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("tenQuocGia", "Quốc gia", { width: "170px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async caAn(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/suat-an/ca-an/index",
                title: "Danh mục ca ăn",
                description: "Quản lý các ca ăn trong hệ thống.",
                page: "Ca ăn",
                activeSubmenu: "ca-an",
                columns: [
                    textColumn("maCaAn", "Mã ca ăn", { width: "140px", className: "catalog-table__cell--center" }),
                    textColumn("tenCaAn", "Tên ca ăn", { className: "catalog-table__cell--center"}),
                    textColumn("gioBatDau", "Giờ bắt đầu", { width: "130px", className: "catalog-table__cell--center" }),
                    textColumn("gioKetThuc", "Giờ kết thúc", { width: "130px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async nhomMonAn(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/nhom-mon-an/index",
                title: "Danh mục nhóm món ăn",
                description: "Quản lý các nhóm phân loại món ăn.",
                page: "Nhóm món ăn",
                activeSubmenu: "nhom-mon-an",
                columns: [
                    textColumn("maNhomMonAn", "Mã nhóm món ăn", { className: "catalog-table__cell--center"}),
                    textColumn("tenNhomMonAn", "Tên nhóm món ăn", { className: "catalog-table__cell--center"}),
                    textColumn("moTa", "Mô tả", { width: "250px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async monAn(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/suat-an/mon-an/index",
                title: "Danh mục món ăn",
                description: "Quản lý danh sách món ăn.",
                page: "Món ăn",
                activeSubmenu: "mon-an",
                columns: [
                    textColumn("maMonAn", "Mã món ăn", { width: "140px", className: "catalog-table__cell--center" }),
                    textColumn("tenMonAn", "Tên món ăn", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("tenNhomMonAn", "Nhóm món ăn", { width: "200px", className: "catalog-table__cell--center" }),
                    numberColumn("giaTien", "Giá tiền", { width: "140px", className: "catalog-table__cell--center" }),
                    numberColumn("giaDuKien", "Giá dự kiến", { width: "150px", className: "catalog-table__cell--center" }),
                    numberColumn("calories", "Calories", { width: "120px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async thucPham(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/suat-an/thuc-pham/index",
                title: "Danh mục thực phẩm",
                description: "Quản lý thực phẩm, đơn vị và quy cách.",
                page: "Thực phẩm",
                activeSubmenu: "thuc-pham",
                columns: [
                    textColumn("maThucPham", "Mã thực phẩm", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("tenThucPham", "Tên thực phẩm", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("tenDonViSoCap", "Đơn vị sơ cấp", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("tenDonViSuDung", "Đơn vị sử dụng", { width: "160px", className: "catalog-table__cell--center" }),
                    numberColumn("heSoQuyDoi", "Hệ số quy đổi", { width: "140px", className: "catalog-table__cell--center" }),
                    textColumn("quyCach", "Quy cách", { width: "180px", className: "catalog-table__cell--center" }),
                    numberColumn("giaNhap", "Giá nhập", { width: "140px", className: "catalog-table__cell--center" }),
                    numberColumn("tyLeHaoHutDuKien", "Tỷ lệ hao hụt", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("xuatXu", "Xuất xứ", { width: "180px", className: "catalog-table__cell--center" }),
                    textColumn("dieuKienBaoQuan", "Điều kiện bảo quản", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("moTa", "Mô tả", { width: "250px", className: "catalog-table__cell--center" }),
                    textColumn("ghiChu", "Ghi chú", { width: "220px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async donViTinh(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/suat-an/don-vi-tinh/index",
                title: "Danh mục đơn vị tính",
                description: "Quản lý đơn vị tính và loại đơn vị.",
                page: "Đơn vị tính",
                activeSubmenu: "don-vi-tinh",
                columns: [
                    textColumn("maDonViTinh", "Mã đơn vị tính", { className: "catalog-table__cell--center"}),
                    textColumn("tenDonViTinh", "Tên đơn vị tính", { className: "catalog-table__cell--center"}),
                    textColumn("loaiDonViText", "Loại đơn vị", { className: "catalog-table__cell--center"}),
                    textColumn("kyHieu", "Ký hiệu", { className: "catalog-table__cell--center"}),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async giaVeAn(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/suat-an/gia-ve-an/index",
                title: "Danh mục giá vé ăn",
                description: "Quản lý giá vé ăn.",
                page: "Giá vé ăn",
                activeSubmenu: "gia-ve-an",
                columns: [
                    textColumn("doiTuongLayVe", "Đối tượng lấy vé", { with: "180", className: "catalog-table__cell--center"}),
                    textColumn("tenCoSo", "Tên cơ sở", { with: "200", className: "catalog-table__cell--center"}),
                    textColumn("tenNhaAn", "Tên nhà ăn", { with: "200", className: "catalog-table__cell--center"}),
                    textColumn("tenCaAn", "Tên ca ăn", { with: "200", className: "catalog-table__cell--center"}),
                    textColumn("donGia", "Đơn giá", { with: "160", className: "catalog-table__cell--center"}),
                    textColumn("tuNgay", "Từ ngày", { with: "150", className: "catalog-table__cell--center"}),
                    textColumn("denNgay", "Đến ngày", { with: "150", className: "catalog-table__cell--center"}),
                    textColumn("mucDoUuTien", "Mức độ ưu tiên", { with: "100", className: "catalog-table__cell--center"}),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async nhanVien(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/nhan-su/nhan-vien/index",
                title: "Danh mục nhân viên",
                description: "Quản lý hồ sơ và thông tin nhân viên.",
                page: "Nhân viên",
                activeSubmenu: "nhan-vien",
                columns: [
                    textColumn("maNhanVien", "Mã nhân viên", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("tenDangNhap", "Tên đăng nhập", { width: "170px", className: "catalog-table__cell--center" }),
                    textColumn("hoTen", "Họ tên", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("email", "Email", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("soDienThoai", "Số điện thoại", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("ngaySinh", "Ngày sinh", { width: "130px", className: "catalog-table__cell--center" }),
                    textColumn("gioiTinh", "Giới tính", {
                        width: "120px",
                        format: value => {
                            const labels = {
                                0: "Nữ",
                                1: "Nam",
                                2: "Khác"
                            };

                            return labels[value] ?? "";
                        }
                    }),
                    textColumn("tenChucVu", "Chức vụ", { width: "180px", className: "catalog-table__cell--center" }),
                    textColumn("tenPhongBan", "Phòng ban", { width: "190px", className: "catalog-table__cell--center" }),
                    textColumn("tenCoSo", "Cơ sở", { width: "190px", className: "catalog-table__cell--center" }),
                    textColumn("diaChi", "Địa chỉ", { className: "catalog-table__cell--center"}),
                    textColumn("tenQuocGia", "Quốc gia", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("tenTinhThanh", "Tỉnh/Thành", { width: "180px", className: "catalog-table__cell--center" }),
                    textColumn("tenXaPhuong", "Xã/Phường", { width: "180px", className: "catalog-table__cell--center" }),
                    textColumn("maThe", "Mã thẻ", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("ghiChu", "Ghi chú", { width: "220px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async taiKhoan(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/nhan-su/tai-khoan/index",
                title: "Danh mục tài khoản",
                description: "Quản lý tài khoản đăng nhập và vai trò.",
                page: "Tài khoản",
                activeSubmenu: "tai-khoan",
                columns: [
                    textColumn("maNhanVien", "Mã nhân viên", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("tenDangNhap", "Tên đăng nhập", { width: "170px", className: "catalog-table__cell--center" }),
                    textColumn("hoTenNhanVien", "Tên nhân viên", { width: "220px", className: "catalog-table__cell--center" }),
                    numberColumn("soLanDangNhap", "Số lần đăng nhập", { width: "160px", className: "catalog-table__cell--center" }),
                    numberColumn("soLanDangNhapSai", "Số lần nhập sai", { width: "150px", className: "catalog-table__cell--center" }),
                    booleanColumn("biKhoa", "Bị khóa", { width: "120px", className: "catalog-table__cell--center" }),
                    textColumn("khoaDen", "Khóa đến", { width: "180px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                    textColumn("__resetPassword", "Thao tác", { width: "90px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async vaiTro(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/vai-tro/index",
                title: "Danh mục vai trò",
                description: "Quản lý vai trò và danh sách quyền.",
                page: "Vai trò",
                activeSubmenu: "vai-tro",
                columns: [
                    textColumn("maVaiTro", "Mã vai trò", { className: "catalog-table__cell--center"}),
                    textColumn("tenVaiTro", "Tên vai trò", { className: "catalog-table__cell--center"}),
                    textColumn("moTa", "Mô tả", { className: "catalog-table__cell--center"}),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async quyen(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/quyen/index",
                title: "Danh mục quyền",
                description: "Quản lý quyền truy cập chức năng.",
                page: "Quyền",
                activeSubmenu: "quyen",
                columns: [
                    textColumn("maQuyen", "Mã quyền", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("tenQuyen", "Tên quyền", { width: "240px", className: "catalog-table__cell--center" }),
                    textColumn("nhomTinhNang", "Nhóm tính năng", { width: "260px", className: "catalog-table__cell--center" }),
                    textColumn("moTa", "Mô tả", { width: "300px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async nhomTinhNang(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/nhom-tinh-nang/index",
                title: "Danh mục nhóm tính năng",
                description: "Phân nhóm các quyền và chức năng hệ thống.",
                page: "Nhóm tính năng",
                activeSubmenu: "nhom-tinh-nang",
                columns: [
                    textColumn("maNhomTinhNang", "Mã nhóm", { className: "catalog-table__cell--center"}),
                    textColumn("tenNhomTinhNang", "Tên nhóm tính năng", { className: "catalog-table__cell--center"}),
                    textColumn("moTa", "Mô tả", { className: "catalog-table__cell--center"}),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async voucher(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/chinh-sach/voucher/index",
                title: "Danh mục voucher",
                description: "Quản lý voucher và giá trị miễn giảm.",
                page: "Voucher",
                activeSubmenu: "voucher",
                columns: [
                    textColumn("maVoucher", "Mã voucher", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("tenVoucher", "Tên voucher", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("loaiMienGiamText", "Loại", { width: "120px", className: "catalog-table__cell--center" }),
                    numberColumn("giaTri", "Giá trị", { width: "120px", className: "catalog-table__cell--center", }),
                    numberColumn("soLuong", "Số lượng", { width: "100px", className: "catalog-table__cell--center" }),
                    numberColumn("daSuDung", "Đã sử dụng", { width: "100px", className: "catalog-table__cell--center" }),
                    numberColumn("thoiGianBatDau", "Thời gian bắt đầu", { width: "150px", className: "catalog-table__cell--center" }),
                    numberColumn("thoiGianKetThuc", "Thời gian kết thúc", { width: "150px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Trạng thái", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async chinhSach(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/chinh-sach/chinh-sach/index",
                title: "Danh mục chính sách",
                description: "Quản lý các chính sách trong hệ thống.",
                page: "Chính sách",
                activeSubmenu: "chinh-sach",
                columns: [
                    textColumn("maChinhSach", "Mã chính sách", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("tenChinhSach", "Tên chính sách", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("loaiChinhSachText", "Loại chính sách", { width: "180px", className: "catalog-table__cell--center" }),
                    textColumn("mucDoUuTien", "Mức độ ưu tiên", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("moTa", "Mô tả", { width: "250px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Trạng thái", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async thietLap(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/thiet-lap/index",
                title: "Thiết lập hệ thống",
                description: "Quản lý các tham số cấu hình của MCS KitchenFlow.",
                page: "Thiết lập",
                activeSubmenu: "thiet-lap",
                columns: [
                    textColumn("maThietLap", "Mã thiết lập", { width: "230px", className: "catalog-table__cell--center" }),
                    textColumn("tenThietLap", "Tên thiết lập", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("giaTri", "Giá trị", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("nhomTinhNang", "Nhóm tính năng", { width: "220px", className: "catalog-table__cell--center" }),
                    textColumn("moTa", "Mô tả", { width: "250px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async baoCao(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/bao-cao/index",
                title: "Danh mục báo cáo",
                description: "Quản lý các báo cáo trong hệ thống.",
                page: "Báo cáo",
                activeSubmenu: "bao-cao",
                columns: [
                    textColumn("maBaoCao", "Mã báo cáo", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("tenBaoCao", "Tên báo cáo", { width: "240px", className: "catalog-table__cell--center" }),
                    textColumn("loaiXuatFileText", "Loại xuất file", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("moTa", "Mô tả", { width: "280px", className: "catalog-table__cell--center" }),
                    booleanColumn("active", "Hiệu lực", { width: "130px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async thongBao(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/he-thong/thong-bao/index",
                title: "Quản lý thông báo",
                description: "Quản lý các thông báo trong hệ thống.",
                page: "Thông báo",
                activeSubmenu: "thong-bao",
                columns: [
                    textColumn("tieuDe", "Tiêu đề", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("noiDung", "Nội dung", { width: "350px", className: "catalog-table__cell--center" }),
                    textColumn("nguonThongBao", "Nguồn", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("phamViGui", "Phạm vi", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("trangThaiHienThi", "Trạng thái", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("soLuongNguoiNhan", "Người nhận", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("soLuongDaDoc", "Đã đọc", { width: "150px", className: "catalog-table__cell--center" }),
                    textColumn("thoiGianGui", "Thời gian", { width: "150px", className: "catalog-table__cell--center" }),
                ]
            });
        } catch (error) {
            next(error);
        }
    }

     async binhChon(req, res, next) {
        try {
            return renderDanhMuc(req, res, {
                view: "pages/danh-muc/binh-chon/binh-chon",
                title: "Quản lý bình chọn",
                description: "Quản lý các bình chọn trong hệ thống.",
                page: "Bình chọn",
                activeSubmenu: "binh-chon",
                columns: [
                    textColumn("ngayThucDon", "Ngày thực đơn", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("tenThucDon", "Tên thực đơn", { width: "240px", className: "catalog-table__cell--center" }),
                    textColumn("Nhà ăn", "Nhà ăn", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("caAn", "Ca ăn", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("batDauThucDon", "Bắt đầu", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("hanThucDon", "Kết thúc", { width: "200px", className: "catalog-table__cell--center" }),
                    textColumn("trangThai", "Trạng thái", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("tongBinhChon", "Tổng bình chọn", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("daThamGia", "Đã tham gia", { width: "160px", className: "catalog-table__cell--center" }),
                    textColumn("thaoTac", "Thao tác", { width: "80px", className: "catalog-table__cell--center" }),

                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async diaDiemNhanHang(
        req,
        res,
        next
    ) {
        try {
            return renderDanhMuc(
                req,
                res,
                {
                    view:
                        "pages/danh-muc/dat-hang/dia-diem-nhan-hang/index",

                    title:
                        "Danh mục địa điểm nhận hàng",

                    description:
                        "Quản lý các địa điểm nhận hàng đã ghi nhớ.",

                    page:
                        "Địa điểm nhận hàng",

                    activeSubmenu:
                        "dia-diem-nhan-hang",

                    columns: [
                        textColumn(
                            "maDiaDiem",
                            "Mã địa điểm",
                            {
                                width:
                                    "160px",
                                className:
                                    "catalog-table__cell--center"
                            }
                        ),
                        textColumn(
                            "tenDiaDiem",
                            "Tên địa điểm",
                            {
                                width:
                                    "220px"
                            }
                        ),
                        textColumn(
                            "diaChiChiTiet",
                            "Địa chỉ chi tiết",
                            {
                                width:
                                    "300px"
                            }
                        ),
                        textColumn(
                            "thongTinLoaiDiaDiem.name",
                            "Loại địa điểm",
                            {
                                width:
                                    "180px",
                                className:
                                    "catalog-table__cell--center"
                            }
                        ),
                        booleanColumn(
                            "laMacDinh",
                            "Mặc định",
                            {
                                width:
                                    "130px",
                                trueLabel:
                                    "Có",
                                falseLabel:
                                    "Không"
                            }
                        ),
                        numberColumn(
                            "thuTuHienThi",
                            "Thứ tự",
                            {
                                width:
                                    "110px"
                            }
                        ),
                        booleanColumn(
                            "active",
                            "Trạng thái",
                            {
                                width:
                                    "130px"
                            }
                        )
                    ]
                }
            );
        } catch (error) {
            next(error);
        }
    }

    async khungGioNhanHang(
        req,
        res,
        next
    ) {
        try {
            return renderDanhMuc(
                req,
                res,
                {
                    view:
                        "pages/danh-muc/dat-hang/khung-gio-nhan-hang/index",

                    title:
                        "Danh mục khung giờ nhận hàng",

                    description:
                        "Quản lý khung giờ nhận hàng theo cơ sở.",

                    page:
                        "Khung giờ nhận hàng",

                    activeSubmenu:
                        "khung-gio-nhan-hang",

                    columns: [
                        textColumn(
                            "maKhungGio",
                            "Mã khung giờ",
                            {
                                width:
                                    "160px"
                            }
                        ),
                        textColumn(
                            "tenKhungGio",
                            "Tên khung giờ",
                            {
                                width:
                                    "210px"
                            }
                        ),
                        textColumn(
                            "tenCoSo",
                            "Cơ sở",
                            {
                                width:
                                    "220px"
                            }
                        ),
                        textColumn(
                            "gioBatDau",
                            "Giờ bắt đầu",
                            {
                                width:
                                    "140px",
                                className:
                                    "catalog-table__cell--center"
                            }
                        ),
                        textColumn(
                            "gioKetThuc",
                            "Giờ kết thúc",
                            {
                                width:
                                    "140px",
                                className:
                                    "catalog-table__cell--center"
                            }
                        ),
                        numberColumn(
                            "soPhutDatTruoc",
                            "Đặt trước",
                            {
                                width:
                                    "130px"
                            }
                        ),
                        numberColumn(
                            "soDonToiDa",
                            "Số đơn tối đa",
                            {
                                width:
                                    "150px"
                            }
                        ),
                        booleanColumn(
                            "active",
                            "Trạng thái",
                            {
                                width:
                                    "130px"
                            }
                        )
                    ]
                }
            );
        } catch (error) {
            next(error);
        }
    }

async nhomSanPham(req, res, next) {
    try {
        return renderDanhMuc(req, res, {
            view:
                "pages/danh-muc/dat-hang/nhom-san-pham/index",

            title:
                "Danh mục nhóm sản phẩm",

            description:
                "Quản lý nhóm sản phẩm, loại sản phẩm và thứ tự hiển thị.",

            page:
                "Nhóm sản phẩm",

            activeSubmenu:
                "nhom-san-pham",

            columns: [
                textColumn(
                    "maNhomSanPham",
                    "Mã nhóm sản phẩm",
                    {
                        width: "180px"
                    }
                ),
                textColumn(
                    "tenNhomSanPham",
                    "Tên nhóm sản phẩm",
                    {
                        width: "240px"
                    }
                ),
                textColumn(
                    "loaiSanPhamText",
                    "Loại sản phẩm",
                    {
                        width: "180px"
                    }
                ),
                textColumn(
                    "moTa",
                    "Mô tả",
                    {
                        width: "300px"
                    }
                ),
                numberColumn(
                    "thuTuHienThi",
                    "Thứ tự hiển thị",
                    {
                        width: "150px"
                    }
                ),
                booleanColumn(
                    "active",
                    "Trạng thái",
                    {
                        width: "130px"
                    }
                )
            ]
        });
    } catch (error) {
        next(error);
    }
}
}

module.exports = new DanhMucWebController();