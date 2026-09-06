"use strict";

const danhMucWebController = require("../../controllers/danh-muc.controller");
const thucDonWebController = require("../../controllers/thuc-don.controller");
const chiTietWebController = require("../../controllers/chi-tiet.controller");
const veAnWebController = require("../../controllers/ve-an.controller");

const danhMucRoutes = [
    {
        method: "get",
        path: "/to-chuc/co-so",
        handler: danhMucWebController.coSo
    },
    {
        method: "get",
        path: "/to-chuc/phong-ban",
        handler: danhMucWebController.phongBan
    },
    {
        method: "get",
        path: "/to-chuc/chuc-vu",
        handler: danhMucWebController.chucVu
    },
    {
        method: "get",
        path: "/to-chuc/nha-an",
        handler: danhMucWebController.nhaAn
    },
    {
        method: "get",
        path: "/to-chuc/kho",
        handler: danhMucWebController.kho
    },
    {
        method: "get",
        path: "/dia-chi/dia-chi-hanh-chinh",
        handler: danhMucWebController.diaChiHanhChinh
    },
    {
        method: "get",
        path: "/dia-chi/quoc-gia",
        handler: danhMucWebController.quocGia
    },
    {
        method: "get",
        path: "/dia-chi/tinh-thanh",
        handler: danhMucWebController.tinhThanh
    },
    {
        method: "get",
        path: "/dia-chi/xa-phuong",
        handler: danhMucWebController.xaPhuong
    },
    {
        method: "get",
        path: "/suat-an/ca-an",
        handler: danhMucWebController.caAn
    },
    {
        method: "get",
        path: "/he-thong/nhom-mon-an",
        handler: danhMucWebController.nhomMonAn
    },
    {
        method: "get",
        path: "/suat-an/mon-an",
        handler: danhMucWebController.monAn
    },
    {
        method: "get",
        path: "/suat-an/thuc-pham",
        handler: danhMucWebController.thucPham
    },
    {
        method: "get",
        path: "/suat-an/don-vi-tinh",
        handler: danhMucWebController.donViTinh
    },
    {
        method: "get",
        path: "/suat-an/gia-ve-an",
        handler: danhMucWebController.giaVeAn
    },
    {
        method: "get",
        path: "/to-chuc/nhan-vien",
        handler: danhMucWebController.nhanVien
    },
    {
        method: "get",
        path: "/phan-quyen/tai-khoan",
        handler: danhMucWebController.taiKhoan
    },
    {
        method: "get",
        path: "/phan-quyen/vai-tro",
        handler: danhMucWebController.vaiTro
    },
    {
        method: "get",
        path: "/phan-quyen/quyen",
        handler: danhMucWebController.quyen
    },
    {
        method: "get",
        path: "/he-thong/nhom-tinh-nang",
        handler: danhMucWebController.nhomTinhNang
    },
    {
        method: "get",
        path: "/chuong-trinh/voucher",
        handler: danhMucWebController.voucher
    },
    {
        method: "get",
        path: "/chuong-trinh/chinh-sach",
        handler: danhMucWebController.chinhSach
    },
    {
        method: "get",
        path: "/he-thong/thiet-lap",
        handler: danhMucWebController.thietLap
    },
    {
        method: "get",
        path: "/he-thong/bao-cao",
        handler: danhMucWebController.baoCao
    },
    {
        method: "get",
        path: "/he-thong/thong-bao",
        handler: danhMucWebController.thongBao
    },
    {
        method: "get",
        path: "/binh-chon/quan-ly-binh-chon",
        handler: danhMucWebController.binhChon
    }
];

const thucDonRoutes = [
    {
        method: "get",
        path: "/thuc-don/danh-sach-thuc-don",
        handler: thucDonWebController.danhSach
    },
    {
        method: "get",
        path: "/thuc-don/them-moi-thuc-don",
        handler: thucDonWebController.themMoi
    },
    {
        method: "get",
        path: "/thuc-don/thong-tin-chi-tiet-thuc-don/:id",
        handler: thucDonWebController.chiTiet
    },
    {
        method: "get",
        path: "/thuc-don/cap-nhat-thong-tin-thuc-don/:id",
        handler: thucDonWebController.capNhat
    }
];

const chiTietRoutes = [
    {
        method: "get",
        path: "/thong-bao",
        handler: chiTietWebController.cuaToi
    },
    {
        method: "get",
        path: "/thong-tin-chi-tiet-thuc-don/:thucDonId/:thucDonNgayId",
        handler: chiTietWebController.thucDon
    },
    {
        method: "get",
        path: "/binh-chon/danh-sach-binh-chon",
        handler: chiTietWebController.danhSachBinhChon
    },
    {
        method: "get",
        path: "/binh-chon/chi-tiet-binh-chon/:thucDonId/:dotBinhChonId",
        handler: chiTietWebController.binhChon
    },
    {
        method: "get",
        path: "/binh-chon/lich-su-binh-chon",
        handler: chiTietWebController.lichSuBinhChon
    }
];

const veAnRoutes = [
    {
        method: "get",
        path: "/danh-sach-lay-ve",
        handler: veAnWebController.danhSachLayVe
    },
    {
        method: "get",
        path: "/lay-ve-an/:id",
        handler: veAnWebController.layVeAn
    },
    {
        method: "get",
        path: "/lay-ve-an",
        handler: (req, res) => res.redirect("/danh-sach-lay-ve")
    }
];

module.exports = [
    ...danhMucRoutes,
    ...thucDonRoutes,
    ...chiTietRoutes,
    ...veAnRoutes
];