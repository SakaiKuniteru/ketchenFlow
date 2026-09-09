const routes = [

    [
        "/enums",
        require(
            "../../modules/danh-muc/he-thong/enums/enum.route"
        )
    ],

    [
        "/auth",
        require(
            "../../modules/danh-muc/nhan-su/xac-thuc/xac-thuc.route"
        )
    ],

    [
        "/dm-nhan-vien",
        require(
            "../../modules/danh-muc/nhan-su/nhan-vien/nhan-vien.route"
        )
    ],

    [
        "/dm-co-so",
        require(
            "../../modules/danh-muc/to-chuc/co-so/co-so.route"
        )
    ],

    [
        "/dm-phong-ban",
        require(
            "../../modules/danh-muc/to-chuc/phong-ban/phong-ban.route"
        )
    ],

    [
        "/dm-chuc-vu",
        require(
            "../../modules/danh-muc/to-chuc/chuc-vu/chuc-vu.route"
        )
    ],

    [
        "/dm-quoc-gia",
        require(
            "../../modules/danh-muc/dia-chi-hanh-chinh/quoc-gia/quoc-gia.route"
        )
    ],

    [
        "/dm-tinh-thanh",
        require(
            "../../modules/danh-muc/dia-chi-hanh-chinh/tinh-thanh/tinh-thanh.route"
        )
    ],

    [
        "/dm-xa-phuong",
        require(
            "../../modules/danh-muc/dia-chi-hanh-chinh/xa-phuong/xa-phuong.route"
        )
    ],

    [
        "/dm-dia-chi",
        require(
            "../../modules/danh-muc/dia-chi-hanh-chinh/dia-chi/dia-chi.route"
        )
    ],

    [
        "/dm-nhom-tinh-nang",
        require(
            "../../modules/danh-muc/he-thong/nhom-tinh-nang/nhom-tinh-nang.route"
        )
    ],

    [
        "/dm-quyen",
        require(
            "../../modules/danh-muc/he-thong/quyen/quyen.route"
        )
    ],

    [
        "/dm-vai-tro",
        require(
            "../../modules/danh-muc/he-thong/vai-tro/vai-tro.route"
        )
    ],

    [
        "/dm-thiet-lap",
        require(
            "../../modules/danh-muc/he-thong/thiet-lap/thiet-lap.route"
        )
    ],

    [
        "/dm-tai-khoan",
        require(
            "../../modules/danh-muc/nhan-su/tai-khoan/tai-khoan.route"
        )
    ],

    [
        "/dm-voucher",
        require(
            "../../modules/danh-muc/chinh-sach/voucher/voucher.route"
        )
    ],

    [
        "/dm-chinh-sach",
        require(
            "../../modules/danh-muc/chinh-sach/chinh-sach/chinh-sach.route"
        )
    ],

    [
        "/dm-don-vi-tinh",
        require(
            "../../modules/danh-muc/suat-an/don-vi-tinh/don-vi-tinh.route"
        )
    ],
    [
        "/dm-gia-ve-an",
        require(
            "../../modules/danh-muc/suat-an/gia-ve-an/gia-ve-an.route"
        )
    ],

    [
        "/dm-nha-an",
        require(
            "../../modules/danh-muc/to-chuc/nha-an/nha-an.route"
        )
    ],

    [
        "/dm-ca-an",
        require(
            "../../modules/danh-muc/suat-an/ca-an/ca-an.route"
        )
    ],

    [
        "/dm-nhom-mon-an",
        require(
            "../../modules/danh-muc/he-thong/nhom-mon-an/nhom-mon-an.route"
        )
    ],

    [
        "/dm-mon-an",
        require(
            "../../modules/danh-muc/suat-an/mon-an/mon-an.route"
        )
    ],

    [
        "/dm-thuc-pham",
        require(
            "../../modules/danh-muc/suat-an/thuc-pham/thuc-pham.route"
        )
    ],

    [
        "/dm-kho",
        require(
            "../../modules/danh-muc/to-chuc/kho/kho.route"
        )
    ],

    [
        "/dm-bao-cao",
        require(
            "../../modules/danh-muc/he-thong/bao-cao/bao-cao.route"
        )
    ],

    // DANH MỤC ĐẶT HÀNG

    [
        "/dm-nhom-san-pham",
        require(
            "../../modules/danh-muc/dat-hang/nhom-san-pham/nhom-san-pham.route"
        )
    ],

    [
        "/dm-san-pham",
        require(
            "../../modules/danh-muc/dat-hang/san-pham/san-pham.route"
        )
    ],

    [
        "/dm-dia-diem-nhan-hang",
        require(
            "../../modules/danh-muc/dat-hang/dia-diem-nhan-hang/dia-diem-nhan-hang.route"
        )
    ],

    [
        "/dm-khung-gio-nhan-hang",
        require(
            "../../modules/danh-muc/dat-hang/khung-gio-nhan-hang/khung-gio-nhan-hang.route"
        )
    ],

    [
        "/dm-voucher-don-hang",
        require(
            "../../modules/danh-muc/dat-hang/voucher-don-hang/voucher-don-hang.route"
        )
    ],

    [
    "/files",
        require(
            "../../modules/mcs/v1/files/files.route"
        )
    ],

    // CẤU HÌNH //

    [
        "/thiet-lap",
        require(
            "../../modules/cau-hinh/cau-hinh.route"
        )
    ],

    // NGHIỆP VỤ

    [
        "/thuc-don",
        require(
            "../../modules/nghiep-vu/thuc-don/thuc-don.route"
        )
    ],

    [
        "/thong-bao",
        require(
            "../../modules/nghiep-vu/thong-bao/thong-bao.route"
        )
    ],

    [
        "/binh-chon",
        require(
            "../../modules/nghiep-vu/binh-chon/binh-chon.route"
        )
    ],

    [
        "/nv-phieu-lay-ve-an",
        require(
            "../../modules/nghiep-vu/lay-ve-an/phieu-lay-ve-an/phieu-lay-ve-an.route"
        )
    ],

    [
        "/ct-phieu-lay-ve-mien-giam",
        require(
            "../../modules/nghiep-vu/lay-ve-an/phieu-lay-ve-mien-giam/phieu-lay-ve-mien-giam.route"
        )
    ],

    [
        "/nv-thanh-toan-ve-an",
        require(
            "../../modules/nghiep-vu/lay-ve-an/thanh-toan-ve-an/thanh-toan-ve-an.route"
        )
    ],

    [
        "/ct-ve-an",
        require(
            "../../modules/nghiep-vu/lay-ve-an/ve-an/ve-an.route"
        )
    ],
];

module.exports = routes;
