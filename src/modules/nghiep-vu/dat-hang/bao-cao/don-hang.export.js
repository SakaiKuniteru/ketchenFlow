'use strict';

const ApiError = require('../../../../utils/api-error');
const repository = require('./don-hang-report.repository');
const { createWorkbook } = require('./don-hang.excel');

async function exportExcel(req, res, next) {
    try {
        const coSoId = Number(req.query.coSoId || req.user.coSoId);
        if (!coSoId) throw new ApiError(400, 'Không xác định được cơ sở xuất báo cáo.');

        const rows = await repository.getData({ ...req.query, coSoId });
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
