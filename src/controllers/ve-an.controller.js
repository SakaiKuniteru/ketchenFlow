"use strict";

const { renderPage } = require("../utils/render-page.util");

function column(
    key,
    label,
    options = {}
) {
    return {
        key,
        label,
        type: options.type || "text",
        width: options.width || "",
        sortable: options.sortable !== false
    };
}

class VeAnWebController {
    async danhSachLayVe(req, res, next) {
        try {
            const columns = [
                column("soPhieu", "Mã phiếu", { width: "150px" }),
                column("nguoiLayVe", "Người lấy vé", { width: "190px" }),
                column("doiTuongLayVe", "Đối tượng", { width: "120px" }),
                column("tenCoSo", "Cơ sở", { width: "150px" }),
                column("tenNhaAn", "Nhà ăn", { width: "150px" }),
                column("tenCaAn", "Ca ăn", { width: "120px" }),
                column("ngay", "Ngày sử dụng", { type: "date", width: "130px" }),
                column("tenThucDon", "Thực đơn", { width: "180px" }),
                column("soLuong", "SL", { width: "70px" }),
                column("tienGoc", "Tiền trước miễn giảm", { type: "money", width: "160px" }),
                column("tongMienGiam", "Tiền miễn giảm", { type: "money", width: "145px" }),
                column("thanhTien", "Thành tiền", { type: "money", width: "140px" }),
                column("phuongThucThanhToan", "PTTT", { width: "125px" }),
                column("trangThai", "Trạng thái thanh toán", { width: "180px" }),
                column("createdAt", "Thời gian tạo", { type: "datetime", width: "175px" }),
                column("thoiGianThanhToan", "Thời gian thanh toán", { type: "datetime", width: "185px" }),
                column("trangThaiSuDung", "Trạng thái sử dụng", { width: "165px" })
            ];

            const filters = [
                {
                    type: "dateRange",
                    label: "Thời gian tạo",
                    from: {
                        id: "filterTuNgayTao",
                        name: "tuNgayTao",
                        label: "Từ ngày",
                        placeholder: "dd/mm/yyyy hh:mm:ss",
                        showTime: true,
                        defaultToday: true,
                        defaultTime: "00:00:00"
                    },
                    to: {
                        id: "filterDenNgayTao",
                        name: "denNgayTao",
                        label: "Đến ngày",
                        placeholder: "dd/mm/yyyy hh:mm:ss",
                        showTime: true,
                        defaultToday: true,
                        defaultTime: "23:59:59"
                    }
                },

                {
                    type: "dateRange",
                    label: "Thời gian thanh toán",
                    from: {
                        id: "filterTuNgayThanhToan",
                        name: "tuNgayThanhToan",
                        label: "Từ ngày",
                        placeholder: "dd/mm/yyyy hh:mm:ss",
                        showTime: true,
                        defaultToday: false,
                        defaultTime: "00:00:00"
                    },
                    to: {
                        id: "filterDenNgayThanhToan",
                        name: "denNgayThanhToan",
                        label: "Đến ngày",
                        placeholder: "dd/mm/yyyy hh:mm:ss",
                        showTime: true,
                        defaultToday: false,
                        defaultTime: "23:59:59"
                    }
                },

                {
                    type: "dateRange",
                    label: "Thời gian miễn giảm",
                    from: {
                        id: "filterTuNgayMienGiam",
                        name: "tuNgayMienGiam",
                        label: "Từ ngày",
                        placeholder: "dd/mm/yyyy hh:mm:ss",
                        showTime: true,
                        defaultToday: false,
                        defaultTime: "00:00:00"
                    },
                    to: {
                        id: "filterDenNgayMienGiam",
                        name: "denNgayMienGiam",
                        label: "Đến ngày",
                        placeholder: "dd/mm/yyyy hh:mm:ss",
                        showTime: true,
                        defaultToday: false,
                        defaultTime: "23:59:59"
                    }
                },

                {
                    type: "select",
                    id: "filterTrangThaiThanhToan",
                    name: "trangThai",
                    label: "Trạng thái thanh toán",
                    placeholder: "Chọn trạng thái thanh toán",
                    source: "/api/mcs/v1/enums?name=trangThaiPhieuThu",
                    valueKey: "value",
                    labelKey: "name"
                },

                {
                    type: "select",
                    id: "filterTrangThaiSuDung",
                    name: "trangThaiSuDung",
                    label: "Trạng thái sử dụng",
                    placeholder: "Chọn trạng thái sử dụng",
                    source: "/api/mcs/v1/enums?name=trangThaiVe",
                    valueKey: "value",
                    labelKey: "name"
                },

                {
                    type: "select",
                    id: "filterCoSoId",
                    name: "coSoId",
                    label: "Cơ sở",
                    placeholder: "Chọn cơ sở",
                    source: "/api/mcs/v1/dm-co-so/tong-hop?active=true",
                    valueKey: "id",
                    labelKey: "tenCoSo"
                },

                {
                    type: "select",
                    id: "filterNhaAnId",
                    name: "nhaAnId",
                    label: "Nhà ăn",
                    placeholder: "Chọn nhà ăn",
                    source: "/api/mcs/v1/dm-nha-an/tong-hop?active=true",
                    valueKey: "id",
                    labelKey: "tenNhaAn"
                },

                {
                    type: "select",
                    id: "filterCaAnId",
                    name: "caAnId",
                    label: "Ca ăn",
                    placeholder: "Chọn ca ăn",
                    source: "/api/mcs/v1/dm-ca-an/tong-hop?active=true",
                    valueKey: "id",
                    labelKey: "tenCaAn"
                },

                {
                    type: "select",
                    id: "filterPhuongThucThanhToan",
                    name: "phuongThucThanhToan",
                    label: "PTTT",
                    placeholder: "Chọn phương thức thanh toán",
                    source: "/api/mcs/v1/enums?name=phuongThucThanhToan",
                    valueKey: "value",
                    labelKey: "name"
                },

                {
                    type: "select",
                    id: "filterThuNganId",
                    name: "thuNganId",
                    label: "Thu ngân",
                    placeholder: "Chọn thu ngân",
                    source: "/api/mcs/v1/dm-nhan-vien/tong-hop?active=true",
                    valueKey: "id",
                    labelKey: "hoTen"
                },

                {
                    type: "select",
                    id: "filterNguoiTaoMienGiamId",
                    name: "nguoiTaoMienGiamId",
                    label: "Người tạo miễn giảm",
                    placeholder: "Chọn người tạo miễn giảm",
                    source: "/api/mcs/v1/dm-nhan-vien/tong-hop?active=true",
                    valueKey: "id",
                    labelKey: "hoTen"
                },

                {
                    type: "select",
                    id: "filterDoiTuongLayVe",
                    name: "doiTuongLayVe",
                    label: "Đối tượng",
                    placeholder: "Chọn đối tượng",
                    source: "/api/mcs/v1/enums?name=doiTuongLayVe",
                    valueKey: "value",
                    labelKey: "name"
                },

                {
                    type: "select",
                    id: "filterLoaiMienGiam",
                    name: "loaiMienGiam",
                    label: "Loại miễn giảm",
                    placeholder: "Chọn loại miễn giảm",
                    source: "/api/mcs/v1/enums?name=loaiMienGiam",
                    valueKey: "value",
                    labelKey: "name"
                }
            ];

            const normalizedFilters = filters.map(
                filter => ({
                    ...filter,
                    isDateRange: filter.type === "dateRange",
                    isSelect: filter.type === "select",
                    isInput: filter.type === "input",
                    isNumber: filter.type === "number"
                })
            );

            const listPage = {
                moduleName: "danh-sach-lay-ve",
                title: "Danh sách lấy vé",
                description: "Theo dõi danh sách vé ăn đã tạo và trạng thái thanh toán.",
                listEndpoint: "/api/mcs/v1/nv-phieu-lay-ve-an/tong-hop",
                showIndex: true,
                showSearch: true,
                searchId: "layVeListSearch",
                searchPlaceholder: "Tìm kiếm theo mã phiếu, người lấy vé...",
                actions: [
                    {
                        action: "create",
                        label: "Lấy vé",
                        icon: "fa-solid fa-plus",
                        className: "data-list-btn--primary"
                    },
                    {
                        action: "export",
                        label: "Xuất dữ liệu",
                        icon: "fa-solid fa-download",
                        className: "data-list-btn--outline"
                    },
                    {
                        action: "filter",
                        label: "Bộ lọc",
                        icon: "fa-solid fa-filter",
                        className: "data-list-btn--outline"
                    }
                ],
                summaryCards: [
                    {
                        key: "total",
                        label: "Tổng vé",
                        description: "Tổng số lượng vé",
                        theme: "primary",
                        icon: "fa-regular fa-file-lines"
                    },
                    {
                        key: "paid",
                        label: "Đã thanh toán",
                        description: "Số vé đã thanh toán",
                        theme: "success",
                        icon: "fa-regular fa-circle-check"
                    },
                    {
                        key: "unpaid",
                        label: "Chưa thanh toán",
                        description: "Số vé chưa thanh toán",
                        theme: "warning",
                        icon: "fa-regular fa-clock"
                    }
                ],
                columns,
                filters: normalizedFilters,
                colspan: columns.length + 1
            };

            return renderPage(
                req,
                res,
                "pages/ve-an/danh-sach-lay-ve",
                {
                    title: "Danh sách lấy vé",
                    pageDescription: "Danh sách lấy vé ăn.",
                    listPage,
                    breadcrumbs: [
                        { label: "Danh sách lấy vé" }
                    ]
                }
            );
        } catch (error) {
            next(error);
        }
    }

    async layVeAn(req, res, next) {
        try {
            return renderPage(
                req,
                res,
                "pages/ve-an/lay-ve-an",
                {
                    title: "Lấy vé ăn",
                    pageDescription: "Lấy vé ăn.",
                    pageId: String(req.params.id || ""),
                    breadcrumbs: [
                        {
                            label: "Danh sách lấy vé",
                            path: "/ve-an/danh-sach-lay-ve"
                        },
                        {
                            label: "Lấy vé ăn"
                        }
                    ]
                }
            );
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VeAnWebController();