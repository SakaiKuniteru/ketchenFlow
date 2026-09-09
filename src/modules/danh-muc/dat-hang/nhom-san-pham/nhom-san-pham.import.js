// "use strict";
// // const createCatalogImport = require("../excel/catalog-import");
// const { toNumber, toBoolean } = require("../../../../helpers/excel/excel-value");
// const repository = require("./nhom-san-pham.repository");
// const service = require("./nhom-san-pham.service");
// const { createSchema, updateSchema } = require("./nhom-san-pham.validation");
// module.exports = createCatalogImport({
//     maBaoCao: "dm_nhom_san_pham", entityName: "nhóm sản phẩm", codeField: "maNhomSanPham",
//     repository, service, createSchema, updateSchema,
//     create: data => service.create(data),
//     fields: [
//         { key: "tenNhomSanPham" }, { key: "loaiSanPham", convert: toNumber },
//         { key: "moTa" }, { key: "thuTuHienThi", convert: toNumber },
//         { key: "active", convert: value => toBoolean(value) }
//     ]
// });
