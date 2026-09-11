'use strict';

const ApiError = require('../../../../utils/api-error');
const pool = require('../../../../config/database');
const catalogRepository = require('../catalog/catalog.repository');
const voucherService = require('../voucher/voucher-ap-dung.service');
const { tinhTongTien } = require('./tinh-tien.helper');

class GioHangService {
    async getNhanVien(nhanVienId, client = pool) {
        const result = await client.query(
            `
                SELECT
                    nv.id,
                    nv.co_so_id AS "coSoId",
                    nv.phong_ban_id AS "phongBanId",
                    nv.chuc_vu_id AS "chucVuId",
                    COALESCE(
                        (
                            SELECT array_agg(ct.nha_an_id)
                            FROM ct_nha_an_nhan_vien ct
                            WHERE ct.nhan_vien_id = nv.id
                                AND ct.active = TRUE
                        ),
                        '{}'
                    ) AS "nhaAnIds"
                FROM dm_nhan_vien nv
                WHERE nv.id = $1
                    AND nv.active = TRUE
            `,
            [nhanVienId]
        );

        if (!result.rows[0]) {
            throw new ApiError(400, 'Nhân viên đặt hàng không tồn tại hoặc đã ngừng hoạt động.');
        }

        return result.rows[0];
    }

    async tinhGioHang(data, user, client = pool, lockVoucher = false) {
        const profile = await this.getNhanVien(user.nhanVienId, client);
        const coSoId = Number(data.coSoId || profile.coSoId);
        const ids = [...new Set(data.items.map((item) => Number(item.sanPhamId)))];
        const products = await catalogRepository.getSanPhamDatHang(coSoId, ids, client);

        if (products.length !== ids.length) {
            throw new ApiError(400, 'Giỏ hàng có sản phẩm không tồn tại hoặc không được phép đặt tại cơ sở.');
        }

        const productMap = new Map(products.map((item) => [Number(item.id), item]));
        const items = data.items.map((input) => {
            const product = productMap.get(Number(input.sanPhamId));
            const quantity = Number(input.soLuong);
            const minimum = Number(product.soLuongToiThieu);
            const maximum = product.soLuongToiDa === null ? null : Number(product.soLuongToiDa);
            const step = Number(product.buocSoLuong);

            if (quantity < minimum || (maximum !== null && quantity > maximum)) {
                throw new ApiError(
                    400,
                    `Số lượng ${product.tenSanPham} phải từ ${minimum}${maximum === null ? ' trở lên' : ` đến ${maximum}`}.`
                );
            }

            if (Math.abs((quantity - minimum) / step - Math.round((quantity - minimum) / step)) > 1e-8) {
                throw new ApiError(400, `Số lượng ${product.tenSanPham} phải tăng theo bước ${step}.`);
            }

            return {
                sanPhamId: product.id,
                maSanPham: product.maSanPham,
                tenSanPham: product.tenSanPham,
                nhomSanPhamId: product.nhomSanPhamId,
                tenNhomSanPham: product.tenNhomSanPham,
                loaiSanPham: product.loaiSanPham,
                tenDonViTinh: product.tenDonViTinh,
                hinhAnh: product.hinhAnh,
                soLuong: quantity,
                donGia: Number(product.giaBan),
                thanhTien: Math.round(quantity * Number(product.giaBan)),
                ghiChu: input.ghiChu || null
            };
        });

        const tamTinh = items.reduce((sum, item) => sum + item.thanhTien, 0);
        const voucher = await voucherService.apply(
            data.maVoucher,
            {
                nhanVienId: profile.id,
                coSoId,
                phongBanId: profile.phongBanId,
                chucVuId: profile.chucVuId,
                nhaAnIds: profile.nhaAnIds,
                tamTinh
            },
            items,
            client,
            lockVoucher
        );
        const totals = tinhTongTien(items, voucher, Number(data.phiDichVu || 0));

        return { coSoId, items, voucher, ...totals };
    }
}

module.exports = new GioHangService();
