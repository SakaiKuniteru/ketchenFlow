const express = require("express");
const router = express.Router();

const {
    kiemTraSchema,
    xacNhanSuDungSchema,
    huySchema
} = require("./ve-an.validation");

const validate = require("../../../../middlewares/validate.middleware");
const authenticate = require("../../../../middlewares/authenticate.middleware");
const authorize = require("../../../../middlewares/authorize.middleware");
const controller = require("./ve-an.controller");

router.get(
    "/tong-hop",
    authenticate,
    authorize("Q001047"),
    controller.getTongHop
);

router.post(
    "/kiem-tra",
    authenticate,
    authorize("Q001048"),
    validate(kiemTraSchema),
    controller.kiemTra
);

router.post(
    "/xac-nhan-su-dung",
    authenticate,
    authorize("Q001049"),
    validate(xacNhanSuDungSchema),
    controller.xacNhanSuDung
);

router.patch(
    "/huy/:id",
    authenticate,
    authorize("Q001050"),
    validate(huySchema),
    controller.huy
);

router.get(
    "/:id",
    authenticate,
    authorize("Q001061"),
    controller.getChiTiet
);

module.exports = router;