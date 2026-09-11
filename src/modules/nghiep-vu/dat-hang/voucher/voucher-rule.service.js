'use strict';

const ApiError = require('../../../../utils/api-error');
const pool = require('../../../../config/database');
const { LOAI_GIAM, PHAM_VI, TRANG_THAI_SU_DUNG, LOAI_SAN_PHAM } = require('./voucher.constants');

class VoucherRuleService {
    async getVoucher(maVoucher, nhanVienId, client = pool, lock = false) {
        if (lock) {
            await client.query(`SELECT id FROM dm_voucher_don_hang WHERE UPPER(ma_voucher) = UPPER($1) FOR UPDATE`, [
                maVoucher
            ]);
        }

        const result = await client.query(
            `
                SELECT
                    v.*,
                    COALESCE(array_agg(DISTINCT vcs.co_so_id) FILTER (WHERE vcs.co_so_id IS NOT NULL), '{}') AS co_so_ids,
                    COALESCE(array_agg(DISTINCT vna.nha_an_id) FILTER (WHERE vna.nha_an_id IS NOT NULL), '{}') AS nha_an_ids,
                    COALESCE(array_agg(DISTINCT vpb.phong_ban_id) FILTER (WHERE vpb.phong_ban_id IS NOT NULL), '{}') AS phong_ban_ids,
                    COALESCE(array_agg(DISTINCT vcv.chuc_vu_id) FILTER (WHERE vcv.chuc_vu_id IS NOT NULL), '{}') AS chuc_vu_ids,
                    COALESCE(array_agg(DISTINCT vnv.nhan_vien_id) FILTER (WHERE vnv.nhan_vien_id IS NOT NULL), '{}') AS nhan_vien_ids,
                    COALESCE(array_agg(DISTINCT vnsp.nhom_san_pham_id) FILTER (WHERE vnsp.nhom_san_pham_id IS NOT NULL), '{}') AS nhom_san_pham_ids,
                    COALESCE(array_agg(DISTINCT vsp.san_pham_id) FILTER (WHERE vsp.san_pham_id IS NOT NULL), '{}') AS san_pham_ids,
                    (SELECT COUNT(*) FROM nv_voucher_don_hang_su_dung sd WHERE sd.voucher_don_hang_id = v.id AND sd.trang_thai IN ($2, $3))::INTEGER AS so_luot_da_dung,
                    (SELECT COUNT(*) FROM nv_voucher_don_hang_su_dung sd WHERE sd.voucher_don_hang_id = v.id AND sd.nhan_vien_id = $4 AND sd.trang_thai IN ($2, $3))::INTEGER AS so_luot_nhan_vien
                FROM dm_voucher_don_hang v
                LEFT JOIN ct_voucher_don_hang_co_so vcs ON vcs.voucher_don_hang_id = v.id
                LEFT JOIN ct_voucher_don_hang_nha_an vna ON vna.voucher_don_hang_id = v.id
                LEFT JOIN ct_voucher_don_hang_phong_ban vpb ON vpb.voucher_don_hang_id = v.id
                LEFT JOIN ct_voucher_don_hang_chuc_vu vcv ON vcv.voucher_don_hang_id = v.id
                LEFT JOIN ct_voucher_don_hang_nhan_vien vnv ON vnv.voucher_don_hang_id = v.id
                LEFT JOIN ct_voucher_don_hang_nhom_san_pham vnsp ON vnsp.voucher_don_hang_id = v.id
                LEFT JOIN ct_voucher_don_hang_san_pham vsp ON vsp.voucher_don_hang_id = v.id
                WHERE UPPER(v.ma_voucher) = UPPER($1)
                GROUP BY v.id
            `,
            [maVoucher, TRANG_THAI_SU_DUNG.GIU_CHO, TRANG_THAI_SU_DUNG.DA_SU_DUNG, nhanVienId]
        );

        return result.rows[0] || null;
    }

    validate(voucher, context) {
        if (!voucher || !voucher.active) {
            throw new ApiError(400, 'Voucher không tồn tại hoặc đã ngừng áp dụng.');
        }

        const now = new Date();
        if (now < new Date(voucher.thoi_gian_bat_dau) || now > new Date(voucher.thoi_gian_ket_thuc)) {
            throw new ApiError(400, 'Voucher chưa đến thời gian áp dụng hoặc đã hết hạn.');
        }

        const rules = [
            [voucher.co_so_ids, context.coSoId, 'Voucher không áp dụng tại cơ sở này.'],
            [voucher.phong_ban_ids, context.phongBanId, 'Voucher không áp dụng cho phòng ban này.'],
            [voucher.chuc_vu_ids, context.chucVuId, 'Voucher không áp dụng cho chức vụ này.'],
            [voucher.nhan_vien_ids, context.nhanVienId, 'Voucher không áp dụng cho nhân viên này.']
        ];

        for (const [ids, value, message] of rules) {
            if (ids.length && !ids.map(Number).includes(Number(value))) {
                throw new ApiError(400, message);
            }
        }

        if (
            voucher.nha_an_ids?.length &&
            !voucher.nha_an_ids.map(Number).some((id) => (context.nhaAnIds || []).map(Number).includes(id))
        ) {
            throw new ApiError(400, 'Voucher không áp dụng cho nhà ăn này.');
        }

        if (Number(context.tamTinh) < Number(voucher.gia_tri_don_hang_toi_thieu)) {
            throw new ApiError(400, 'Giỏ hàng chưa đạt giá trị tối thiểu của voucher.');
        }

        if (voucher.so_luong_phat_hanh !== null && voucher.so_luot_da_dung >= voucher.so_luong_phat_hanh) {
            throw new ApiError(400, 'Voucher đã hết lượt sử dụng.');
        }

        if (voucher.so_luot_moi_nhan_vien !== null && voucher.so_luot_nhan_vien >= voucher.so_luot_moi_nhan_vien) {
            throw new ApiError(400, 'Bạn đã sử dụng hết số lượt của voucher này.');
        }
    }

    calculate(voucher, items) {
        let eligibleItems =
            voucher.loai_giam === LOAI_GIAM.MIEN_PHI_DICH_VU
                ? items.filter((item) => Number(item.loaiSanPham) === LOAI_SAN_PHAM.DICH_VU_KHAC)
                : items;

        if (voucher.pham_vi_ap_dung === PHAM_VI.NHOM_SAN_PHAM) {
            eligibleItems = items.filter((item) =>
                voucher.nhom_san_pham_ids.map(Number).includes(Number(item.nhomSanPhamId))
            );
        }

        if (voucher.pham_vi_ap_dung === PHAM_VI.SAN_PHAM) {
            eligibleItems = items.filter((item) => voucher.san_pham_ids.map(Number).includes(Number(item.sanPhamId)));
        }

        const soTienDuDieuKien = eligibleItems.reduce((sum, item) => sum + Number(item.thanhTien), 0);
        let soTienGiam = 0;

        if (voucher.loai_giam === LOAI_GIAM.PHAN_TRAM) {
            soTienGiam = (soTienDuDieuKien * Number(voucher.gia_tri)) / 100;
        } else if (voucher.loai_giam === LOAI_GIAM.SO_TIEN) {
            soTienGiam = Number(voucher.gia_tri);
        } else if (voucher.loai_giam === LOAI_GIAM.MIEN_PHI_DICH_VU) {
            soTienGiam = soTienDuDieuKien;
        }

        if (voucher.giam_toi_da !== null) {
            soTienGiam = Math.min(soTienGiam, Number(voucher.giam_toi_da));
        }

        return {
            soTienDuDieuKien: Math.round(soTienDuDieuKien),
            soTienGiam: Math.round(Math.min(soTienGiam, soTienDuDieuKien))
        };
    }
}

module.exports = new VoucherRuleService();
