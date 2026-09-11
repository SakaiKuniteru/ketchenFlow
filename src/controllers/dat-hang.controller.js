'use strict';

const { renderPage } = require('../utils/render-page.util');

function renderOrderPage(req, res, view, options = {}) {
    return renderPage(req, res, view, {
        layout: 'order',
        activeMenu: 'dat-hang',
        orderFlowPage: true,
        orderScript: '/assets/js/pages/dat-hang/order-flow.js',
        ...options
    });
}

class DatHangWebController {
    datMon(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/dat-hang', {
                title: 'Đặt món',
                breadcrumbs: [{ label: 'Đặt món' }],
                orderPage: 'catalog'
            });
        } catch (error) {
            next(error);
        }
    }

    thongTinNhanHang(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/thong-tin-nhan-hang', {
                title: 'Thông tin nhận hàng',
                breadcrumbs: [{ label: 'Đặt món', path: '/dat-hang/dat-mon' }, { label: 'Thông tin nhận hàng' }],
                orderPage: 'delivery'
            });
        } catch (error) {
            next(error);
        }
    }

    xacNhanDonHang(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/xac-nhan-don-hang', {
                title: 'Xác nhận đơn hàng',
                breadcrumbs: [{ label: 'Đặt món', path: '/dat-hang/dat-mon' }, { label: 'Xác nhận đơn hàng' }],
                orderPage: 'confirmation'
            });
        } catch (error) {
            next(error);
        }
    }

    hoanTatDonHang(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/hoan-tat-don-hang', {
                title: 'Hoàn tất đơn hàng',
                breadcrumbs: [{ label: 'Đặt món', path: '/dat-hang/dat-mon' }, { label: 'Hoàn tất' }],
                orderPage: 'completed',
                orderId: req.params.id
            });
        } catch (error) {
            next(error);
        }
    }

    nhanDonHang(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/nhan-don-hang', {
                title: 'Nhận đơn hàng',
                breadcrumbs: [{ label: 'Nhận đơn hàng' }],
                orderPage: 'management'
            });
        } catch (error) {
            next(error);
        }
    }

    chiTietXuLyDonHang(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/chi-tiet-xu-ly-don-hang', {
                title: 'Chi tiết xử lý đơn hàng',
                breadcrumbs: [
                    { label: 'Nhận đơn hàng', path: '/dat-hang/nhan-don-hang' },
                    { label: 'Chi tiết xử lý đơn hàng' }
                ],
                orderPage: 'management-detail',
                orderId: req.params.id
            });
        } catch (error) {
            next(error);
        }
    }

    danhSachDonHangCuaToi(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/danh-sach-don-hang-cua-toi', {
                title: 'Đơn hàng của tôi',
                breadcrumbs: [{ label: 'Đơn hàng của tôi' }],
                orderPage: 'my-orders'
            });
        } catch (error) {
            next(error);
        }
    }

    chiTietDonHangCuaToi(req, res, next) {
        try {
            return renderOrderPage(req, res, 'pages/dat-hang/chi-tiet-don-hang-cua-toi', {
                title: 'Chi tiết đơn hàng',
                breadcrumbs: [
                    { label: 'Đơn hàng của tôi', path: '/dat-hang/danh-sach-don-hang-cua-toi' },
                    { label: 'Chi tiết đơn hàng' }
                ],
                orderPage: 'my-order-detail',
                orderId: req.params.id
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DatHangWebController();
