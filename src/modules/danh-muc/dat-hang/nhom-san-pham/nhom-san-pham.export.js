// "use strict";

// const repository = require("./nhom-san-pham.repository");
// const { createExportFile } = require("../../../../helpers/excel/excel-export");
// const { sendExcel } = require("../../../../helpers/excel/excel-response");

// const MA_BAO_CAO = "dm_nhom_san_pham";

// function taoDongExport(item) {
//     return {
//         id: item.id,
//         maNhomSanPham: item.maNhomSanPham,
//         tenNhomSanPham: item.tenNhomSanPham,
//         loaiSanPham: item.loaiSanPham,
//         moTa: item.moTa,
//         thuTuHienThi: item.thuTuHienThi,
//         active: item.active
//     };
// }

// async function xuLyExport(query = {}) {
//     return createExportFile({
//         maBaoCao: MA_BAO_CAO,
//         headerRowNumber: 3,
//         templateRowNumber: 5,
//         dataStartRowNumber: 5,
//         data: (await repository.getTongHop(query)).map(taoDongExport)
//     });
// }

// async function exportData(
//     req,
//     res,
//     next
// ) {
//     try {
//         return sendExcel(
//             res,
//             await xuLyExport(req.query)
//         );
//     } catch (error) {
//         return next(error);
//     }
// }

// module.exports = {
//     exportData,
//     xuLyExport,
//     taoDongExport
// };