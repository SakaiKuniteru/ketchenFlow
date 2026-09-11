'use strict';

const ApiError = require('../../../../utils/api-error');
const repository = require('./catalog.repository');
const gioHangService = require('../gio-hang/gio-hang.service');
const { listQuerySchema, tinhGioHangSchema } = require('./catalog.validation');
const { loaiSanPham } = require('../../../../constants/enums');
const slotService = require('../../../danh-muc/dat-hang/khung-gio-nhan-hang/khung-gio-nhan-hang.service');

function validate(schema, data) {
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        throw new ApiError(400, error.details.map((item) => item.message).join(', '));
    }

    return value;
}

class CatalogService {
    async getDanhSach(query, user) {
        const profile = await gioHangService.getNhanVien(user.nhanVienId);
        const data = validate(listQuerySchema, {
            ...query,
            coSoId: profile.coSoId
        });

        if (!data.coSoId) {
            throw new ApiError(400, 'Không xác định được cơ sở đặt hàng.');
        }

        const result = await repository.getDanhSachSanPham(data);
        return {
            ...result,
            items: result.items.map((item) => ({
                ...item,
                thongTinLoaiSanPham:
                    loaiSanPham.find((option) => Number(option.value) === Number(item.loaiSanPham)) || null
            }))
        };
    }

    async getThongTinCheckout(query, user) {
        const profile = await gioHangService.getNhanVien(user.nhanVienId);
        const coSoId = Number(profile.coSoId);

        if (!coSoId || !user.nhanVienId) {
            throw new ApiError(400, 'Không xác định được nhân viên hoặc cơ sở đặt hàng.');
        }

        const ngayNhan =
            query.ngayNhan || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
        const [checkout, slots] = await Promise.all([
            repository.getThongTinCheckout(coSoId, user.nhanVienId),
            slotService.getKhungGioKhaDung({ coSoId, ngayNhan })
        ]);
        return { ...checkout, ngayNhan, khungGioNhanHang: slots.items, soPhutDatTruoc: slots.soPhutDatTruoc };
    }

    tinhGioHang(body, user) {
        const data = validate(tinhGioHangSchema, body);
        return gioHangService.tinhGioHang(data, user);
    }
}

module.exports = new CatalogService();
