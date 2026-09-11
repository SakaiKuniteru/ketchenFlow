'use strict';

const ApiError = require('../../../../utils/api-error');
const repository = require('./catalog.repository');
const gioHangService = require('../gio-hang/gio-hang.service');
const { listQuerySchema, tinhGioHangSchema } = require('./catalog.validation');
const { loaiSanPham } = require('../../../../constants/enums');

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
        const data = validate(listQuerySchema, {
            ...query,
            coSoId: query.coSoId || user.coSoId
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

    getThongTinCheckout(query, user) {
        const coSoId = Number(query.coSoId || user.coSoId);

        if (!coSoId || !user.nhanVienId) {
            throw new ApiError(400, 'Không xác định được nhân viên hoặc cơ sở đặt hàng.');
        }

        return repository.getThongTinCheckout(coSoId, user.nhanVienId);
    }

    tinhGioHang(body, user) {
        const data = validate(tinhGioHangSchema, body);
        return gioHangService.tinhGioHang(data, user);
    }
}

module.exports = new CatalogService();
