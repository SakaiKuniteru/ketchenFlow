'use strict';

const pool = require('../../../../config/database');
const thongBaoService = require('../../thong-bao/thong-bao.service');

class ThongBaoDonHangService {
    async sendToEmployee(data) {
        const result = await pool.query(`SELECT id FROM dm_tai_khoan WHERE nhan_vien_id = $1 AND active = TRUE`, [
            data.nhanVienId
        ]);

        if (!result.rows[0]) return null;

        return thongBaoService.createTuDong({
            tieuDe: data.tieuDe,
            noiDung: data.noiDung,
            guiTatCa: false,
            doiTuong: [{ loaiDoiTuong: 30, doiTuongId: result.rows[0].id }],
            maSuKien: data.maSuKien,
            loaiThamChieu: 'DON_HANG',
            thamChieuId: data.donHangId,
            duongDan: `/dat-hang/don-hang/${data.donHangId}`,
            nguoiTaoId: data.nguoiTaoId || null
        });
    }
}

module.exports = new ThongBaoDonHangService();
