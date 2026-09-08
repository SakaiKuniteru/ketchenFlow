const express = require("express");
const router = express.Router();

const {
    createSchema,
    updateSchema,
    huySchema
} = require("./phieu-lay-ve-an.validation");

const validate = require("../../../../middlewares/validate.middleware");
const authenticate = require("../../../../middlewares/authenticate.middleware");
const authorize = require("../../../../middlewares/authorize.middleware");
const controller = require("./phieu-lay-ve-an.controller");

router.get(
    "/tong-hop",
    authenticate,
    authorize("Q000030"),
    controller.getTongHop
);

router.get(
    "/thuc-don-ngay-hop-le",
    authenticate,
    authorize("Q001051"),
    controller.getThucDonNgayHopLe
);

router.get(
    "/gia-ve",
    authenticate,
    authorize("Q001052"),
    controller.getGiaVe
);

router.get(
    "/in-ve/:id",
    authenticate,
    authorize("Q001036"),
    controller.inVe
);

router.get(
    "/:id",
    authenticate,
    authorize("Q001032", "Q001033", "Q001034"),
    controller.getChiTiet
);

router.post(
    "/them-moi",
    authenticate,
    authorize("Q001033", "Q001034"),
    validate(createSchema),
    controller.create
);

router.patch(
    "/cap-nhat/:id",
    authenticate,
    authorize("Q001034"),
    validate(updateSchema),
    controller.update
);

router.patch(
    "/huy/:id",
    authenticate,
    authorize("Q001035"),
    validate(huySchema),
    controller.huy
);

module.exports = router;