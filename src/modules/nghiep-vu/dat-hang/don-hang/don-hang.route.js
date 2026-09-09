"use strict";

const express = require("express");
const authenticate = require("../../../../middlewares/authenticate.middleware");
const authorize = require("../../../../middlewares/authorize.middleware");
const validate = require("../../../../middlewares/validate.middleware");
const controller = require("./don-hang.controller");
const report = require("../bao-cao/don-hang.export");
const { createSchema, actionSchema } = require("./don-hang.validation");

const router = express.Router();
router.use(authenticate);

router.post("/tao-moi", validate(createSchema), controller.create);
router.get("/cua-toi", controller.listMine);
router.get("/quan-ly", authorize("Q002031"), controller.listManagement);
router.get("/quan-ly/xuat-du-lieu", authorize("Q002031"), report.exportExcel);
router.get("/quan-ly/:id", authorize("Q002031"), controller.managementDetail);
router.get("/:id", controller.detail);
router.patch("/:id/xac-nhan", authorize("Q002032"), validate(actionSchema), controller.xacNhan);
router.patch("/:id/tu-choi", authorize("Q002032"), validate(actionSchema), controller.tuChoi);
router.patch("/:id/huy", validate(actionSchema), controller.huy);
router.patch("/:id/san-sang-giao", authorize("Q002032"), validate(actionSchema), controller.sanSangGiao);
router.patch("/:id/bat-dau-giao", authorize("Q002032"), validate(actionSchema), controller.batDauGiao);
router.patch("/:id/hoan-thanh", authorize("Q002032"), validate(actionSchema), controller.hoanThanh);

module.exports = router;
