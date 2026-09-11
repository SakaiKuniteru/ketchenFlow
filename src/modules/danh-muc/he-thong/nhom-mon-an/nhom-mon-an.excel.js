'use strict';

const nhomMonAnExport = require('./nhom-mon-an.export');

const nhomMonAnImport = require('./nhom-mon-an.import');

module.exports = {
    exportData: nhomMonAnExport.exportData,
    importData: nhomMonAnImport.importData
};
