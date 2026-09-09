"use strict";

const express = require("express");
const authenticate = require("../../../../middlewares/authenticate.middleware");
const authorize = require("../../../../middlewares/authorize.middleware");
const validate = require("../../../../middlewares/validate.middleware");
const controller = require("./khung-gio-nhan-hang.controller");

const {
    createSchema,
    updateSchema
} = require("./khung-gio-nhan-hang.validation");

const router = express.Router();

router.get(
    "/tong-hop",
    authenticate,
    authorize("Q002061"),
    controller.getTongHop
);

router.get(
    "/:id",
    authenticate,
    authorize("Q002061"),
    controller.getChiTiet
);

router.post(
    "/them-moi",
    authenticate,
    authorize("Q002062"),
    validate(createSchema),
    controller.create
);

router.patch(
    "/cap-nhat/:id",
    authenticate,
    authorize("Q002063"),
    validate(updateSchema),
    controller.update
);

module.exports = router;