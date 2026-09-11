'use strict';

const ApiError = require('../../../../utils/api-error');
const repository = require('./don-hang-report.repository');
const { createWorkbook } = require('./don-hang.excel');
const cartService = require('../gio-hang/gio-hang.service');
const { listSchema } = require('../don-hang/don-hang.validation');

async function exportExcel(req, res, next) {
    try {
        const profile = await cartService.getNhanVien(req.user.nhanVienId);
        const coSoId = Number(profile.coSoId);
        if (!coSoId) throw new ApiError(400, 'Không xác định được cơ sở xuất báo cáo.');

        const { error, value } = listSchema.validate({ ...req.query, coSoId }, { stripUnknown: true });
        if (error) throw new ApiError(400, error.message);
        const rows = await repository.getData(value);
        const workbook = await createWorkbook(rows);
        const fileName = `don-hang-${new Date().toISOString().slice(0, 10)}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=\"${fileName}\"`);
        await workbook.xlsx.write(res);
        return res.end();
    } catch (error) {
        return next(error);
    }
}

module.exports = { exportExcel };
