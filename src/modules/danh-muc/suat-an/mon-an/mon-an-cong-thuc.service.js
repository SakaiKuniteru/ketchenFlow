'use strict';

const ApiError = require('../../../../utils/api-error');
const cauHinhService = require('../../../cau-hinh/cau-hinh.service');

class MonAnCongThucService {
    async getCauHinhLamTron() {
        const [quyTacLamTron, soChuSoSauDauPhay] = await Promise.all([
            cauHinhService.getQuyTacLamTron(),
            cauHinhService.getSoChuSoSauDauPhay()
        ]);

        return {
            quyTacLamTron,
            soChuSoSauDauPhay
        };
    }

    lamTron(value, quyTacLamTron, soChuSoSauDauPhay) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return 0;
        }

        const soChuSo =
            Number.isInteger(Number(soChuSoSauDauPhay)) &&
            Number(soChuSoSauDauPhay) >= 0 &&
            Number(soChuSoSauDauPhay) <= 5
                ? Number(soChuSoSauDauPhay)
                : 2;

        const quyTac = [0, 1, 2].includes(Number(quyTacLamTron)) ? Number(quyTacLamTron) : 0;

        const heSo = 10 ** soChuSo;

        const giaTri = number * heSo;

        let ketQua;

        switch (quyTac) {
            case 1:
                ketQua = Math.ceil(giaTri - Number.EPSILON);

                break;

            case 2:
                ketQua = Math.floor(giaTri + Number.EPSILON);

                break;

            case 0:
            default:
                ketQua = Math.round(giaTri + Number.EPSILON);

                break;
        }

        return ketQua / heSo;
    }

    tinhThucPham(row, cauHinh) {
        const lamTron = (value) => this.lamTron(value, cauHinh.quyTacLamTron, cauHinh.soChuSoSauDauPhay);

        const dinhLuong = Number(row.dinh_luong || 0);

        const heSoQuyDoi = Number(row.he_so_quy_doi || 1);

        const giaNhap = Number(row.gia_nhap || 0);

        const tyLeHaoHutDuKien = Number(row.ty_le_hao_hut_du_kien || 0);

        if (heSoQuyDoi <= 0) {
            throw new ApiError(400, `Hệ số quy đổi của thực phẩm "${row.ten_thuc_pham}" phải lớn hơn 0.`);
        }

        if (tyLeHaoHutDuKien < 0 || tyLeHaoHutDuKien >= 100) {
            throw new ApiError(400, `Tỷ lệ hao hụt của thực phẩm "${row.ten_thuc_pham}" phải từ 0 đến nhỏ hơn 100.`);
        }

        const tyLeHaoHut = tyLeHaoHutDuKien / 100;

        const giaTruocHaoHutDvsc = lamTron(giaNhap);

        const giaTruocHaoHutDvsd = lamTron(giaNhap / heSoQuyDoi);

        const giaTheoDonViSuDung = giaTruocHaoHutDvsd;

        const soLuongHaoHutDvsc = lamTron(1 * tyLeHaoHut);

        const soLuongConLaiSauHaoHutDvsc = lamTron(1 - soLuongHaoHutDvsc);

        const soLuongHaoHutDvsd = lamTron(heSoQuyDoi * tyLeHaoHut);

        const soLuongConLaiSauHaoHutDvsd = lamTron(heSoQuyDoi - soLuongHaoHutDvsd);

        const giaSauHaoHutDvsc = lamTron(giaNhap / (1 - tyLeHaoHut));

        const giaHaoHutDvsc = lamTron(giaSauHaoHutDvsc - giaTruocHaoHutDvsc);

        const giaSauHaoHutDvsd = lamTron(giaSauHaoHutDvsc / heSoQuyDoi);

        const giaHaoHutDvsd = lamTron(giaSauHaoHutDvsd - giaTruocHaoHutDvsd);

        const dinhLuongDvsd = lamTron(dinhLuong);

        const dinhLuongDvsc = lamTron(dinhLuong / heSoQuyDoi);

        const dinhLuongSauHaoHutDvsd = lamTron(dinhLuong / (1 - tyLeHaoHut));

        const dinhLuongSauHaoHutDvsc = lamTron(dinhLuongSauHaoHutDvsd / heSoQuyDoi);

        const dinhLuongHaoHutDvsd = lamTron(dinhLuongSauHaoHutDvsd - dinhLuongDvsd);

        const dinhLuongHaoHutDvsc = lamTron(dinhLuongSauHaoHutDvsc - dinhLuongDvsc);

        const thanhTienTruocHaoHutDvsc = lamTron(dinhLuongDvsc * giaTruocHaoHutDvsc);

        const thanhTienTruocHaoHutDvsd = lamTron(dinhLuongDvsd * giaTruocHaoHutDvsd);

        const thanhTienHaoHutDvsc = lamTron(dinhLuongDvsc * giaHaoHutDvsc);

        const thanhTienHaoHutDvsd = lamTron(dinhLuongDvsd * giaHaoHutDvsd);

        const thanhTienHaoHut = thanhTienHaoHutDvsd;

        const thanhTienSauHaoHutDvsc = lamTron(dinhLuongDvsc * giaSauHaoHutDvsc);

        const thanhTienSauHaoHutDvsd = lamTron(dinhLuongDvsd * giaSauHaoHutDvsd);

        const thanhTienDvsc = thanhTienSauHaoHutDvsc;

        const thanhTienDvsd = thanhTienSauHaoHutDvsd;

        const thanhTien = thanhTienDvsd;

        return {
            id: row.id,
            thucPhamId: row.thuc_pham_id,
            maThucPham: row.ma_thuc_pham,
            tenThucPham: row.ten_thuc_pham,

            donViSoCapId: row.don_vi_so_cap_id,

            donViSoCap: {
                id: row.don_vi_so_cap_id,
                ma: row.ma_don_vi_so_cap,
                ten: row.ten_don_vi_so_cap,
                kyHieu: row.ky_hieu_don_vi_so_cap
            },

            donViSuDungId: row.don_vi_su_dung_id,

            donViSuDung: {
                id: row.don_vi_su_dung_id,
                ma: row.ma_don_vi_su_dung,
                ten: row.ten_don_vi_su_dung,
                kyHieu: row.ky_hieu_don_vi_su_dung
            },

            heSoQuyDoi,
            quyCach: row.quy_cach,

            tyLeHaoHutDuKien,
            tyLeHaoHut,

            giaNhap,
            giaTruocHaoHutDvsc,
            giaTruocHaoHutDvsd,
            giaTheoDonViSuDung,
            giaHaoHutDvsc,
            giaHaoHutDvsd,
            giaSauHaoHutDvsc,
            giaSauHaoHutDvsd,

            soLuongHaoHutDvsc,
            soLuongConLaiSauHaoHutDvsc,
            soLuongHaoHutDvsd,
            soLuongConLaiSauHaoHutDvsd,

            dinhLuong,
            dinhLuongDvsc,
            dinhLuongDvsd,
            dinhLuongHaoHutDvsc,
            dinhLuongHaoHutDvsd,
            dinhLuongSauHaoHutDvsc,
            dinhLuongSauHaoHutDvsd,

            thanhTienTruocHaoHutDvsc,
            thanhTienTruocHaoHutDvsd,
            thanhTienHaoHutDvsc,
            thanhTienHaoHutDvsd,
            thanhTienHaoHut,
            thanhTienSauHaoHutDvsc,
            thanhTienSauHaoHutDvsd,
            thanhTienDvsc,
            thanhTienDvsd,
            thanhTien,

            ghiChu: row.ghi_chu
        };
    }

    async build(rows = []) {
        const cauHinh = await this.getCauHinhLamTron();

        const dsThucPham = rows.map((row) => this.tinhThucPham(row, cauHinh));

        const lamTron = (value) => this.lamTron(value, cauHinh.quyTacLamTron, cauHinh.soChuSoSauDauPhay);

        const sum = (key) => lamTron(dsThucPham.reduce((tong, item) => tong + Number(item[key] || 0), 0));

        return {
            cauHinhLamTron: {
                quyTac: cauHinh.quyTacLamTron,
                soChuSoSauDauPhay: cauHinh.soChuSoSauDauPhay
            },

            soLuongThucPham: dsThucPham.length,

            tongTien: {
                dinhLuong: sum('dinhLuong'),
                thanhTienTruocHaoHutDvsc: sum('thanhTienTruocHaoHutDvsc'),
                thanhTienTruocHaoHutDvsd: sum('thanhTienTruocHaoHutDvsd'),
                thanhTienHaoHutDvsc: sum('thanhTienHaoHutDvsc'),
                thanhTienHaoHutDvsd: sum('thanhTienHaoHutDvsd'),
                thanhTienSauHaoHutDvsc: sum('thanhTienSauHaoHutDvsc'),
                thanhTienSauHaoHutDvsd: sum('thanhTienSauHaoHutDvsd'),
                thanhTien: sum('thanhTien')
            },

            dsThucPham
        };
    }
}

module.exports = new MonAnCongThucService();
