'use strict';

const { trangThaiThucDon, loaiThucDon } = require('../constants/enums');
const { renderPage } = require('../utils/render-page.util');

function getFormOptions() {
    return {
        loaiThucDon: loaiThucDon.map((item) => ({
            value: String(item.value),
            label: item.label
        })),

        trangThai: trangThaiThucDon.map((item) => ({
            value: String(item.value),
            label: item.label
        }))
    };
}

class ThucDonWebController {
    async danhSach(req, res, next) {
        try {
            return renderPage(req, res, 'pages/thuc-don/danh-sach', {
                title: 'Danh sách thực đơn',
                pageDescription: 'Quản lý danh sách thực đơn.',
                isModuleListPage: true,
                activeMenu: 'thuc-don',
                columns: [
                    {
                        key: 'maThucDon',
                        label: 'Mã thực đơn'
                    },
                    {
                        key: 'tenThucDon',
                        label: 'Tên thực đơn'
                    },
                    {
                        key: 'loaiThucDon',
                        label: 'Loại thực đơn'
                    },
                    {
                        key: 'coSo',
                        label: 'Cơ sở'
                    },
                    {
                        key: 'nhaAn',
                        label: 'Nhà ăn'
                    },
                    {
                        key: 'caAn',
                        label: 'Ca ăn'
                    },
                    {
                        key: 'trangThai',
                        label: 'Trạng thái'
                    }
                ],

                formOptions: getFormOptions()
            });
        } catch (error) {
            next(error);
        }
    }

    async themMoi(req, res, next) {
        try {
            return renderPage(req, res, 'pages/thuc-don/them-moi', {
                title: 'Thêm mới thực đơn',
                activeMenu: 'thuc-don',
                formMode: 'create',
                formOptions: getFormOptions(),

                breadcrumbs: [
                    {
                        label: 'Danh sách thực đơn',
                        path: '/thuc-don/danh-sach-thuc-don'
                    },
                    {
                        label: 'Thêm mới'
                    }
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async chiTiet(req, res, next) {
        try {
            const { id } = req.params;

            return renderPage(req, res, 'pages/thuc-don/chi-tiet', {
                title: 'Chi tiết thực đơn',
                thucDonId: id,
                formMode: 'detail',
                activeMenu: 'thuc-don',
                formOptions: getFormOptions(),

                breadcrumbs: [
                    {
                        label: 'Danh sách thực đơn',
                        path: '/thuc-don/danh-sach-thuc-don'
                    },
                    {
                        label: 'Chi tiết'
                    }
                ]
            });
        } catch (error) {
            next(error);
        }
    }

    async capNhat(req, res, next) {
        try {
            const { id } = req.params;

            return renderPage(req, res, 'pages/thuc-don/cap-nhat', {
                title: 'Cập nhật thực đơn',
                thucDonId: id,
                formMode: 'update',
                activeMenu: 'thuc-don',
                formOptions: getFormOptions(),

                breadcrumbs: [
                    {
                        label: 'Danh sách thực đơn',
                        path: '/thuc-don/danh-sach-thuc-don'
                    },
                    {
                        label: 'Chi tiết',
                        path: `/thuc-don/thong-tin-chi-tiet-thuc-don/${id}`
                    },
                    {
                        label: 'Cập nhật'
                    }
                ]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ThucDonWebController();
