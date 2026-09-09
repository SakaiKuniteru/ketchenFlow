"use strict";
const exporter = require("./nhom-san-pham.export");
const importer = require("./nhom-san-pham.import");
module.exports = { exportData: exporter.exportData, importData: importer.importData };
