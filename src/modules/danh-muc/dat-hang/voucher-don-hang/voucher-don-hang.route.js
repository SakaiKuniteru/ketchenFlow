"use strict";

const express = require("express");
const authenticate = require("../../../../middlewares/authenticate.middleware");
const authorize = require("../../../../middlewares/authorize.middleware");
const validate = require("../../../../middlewares/validate.middleware");
const controller = require("./voucher-don-hang.controller");
const uploadImportExcel = require("../../../../middlewares/upload-import-excel.middleware");
// const excel = require("./voucher-don-hang.excel");

const {
    createSchema,
    updateSchema
} = require("./voucher-don-hang.validation");

const router = express.Router();

router.get(
    "/tong-hop",
    authenticate,
    authorize("Q002031"),
    controller.getTongHop
);

// router.get(
//     "/xuat-du-lieu",
//     authenticate,
//     authorize("Q100001"),
//     excel.exportData
// );

// router.post(
//     "/import-du-lieu",
//     authenticate,
//     authorize("Q100002"),
//     uploadImportExcel.single("file"),
//     excel.importData
// );

router.get(
    "/:id",
    authenticate,
    authorize("Q002031"),
    controller.getChiTiet
);

router.post(
    "/them-moi",
    authenticate,
    authorize("Q002032"),
    validate(createSchema),
    controller.create
);

router.patch(
    "/cap-nhat/:id",
    authenticate,
    authorize("Q002033"),
    validate(updateSchema),
    controller.update
);

module.exports = router;
