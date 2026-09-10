const express = require("express");

const authenticate =
    require("../../../../middlewares/authenticate.middleware");

const authorize =
    require("../../../../middlewares/authorize.middleware");

const validate =
    require("../../../../middlewares/validate.middleware");

const controller =
    require("./dia-diem-nhan-hang.controller");

const {
    createSchema,
    updateSchema
} = require("./dia-diem-nhan-hang.validation");


const router =
    express.Router();


router.get(
    "/tong-hop",
    authenticate,
    authorize("Q000035", "Q002064"),
    controller.getTongHop
);


router.get(
    "/:id",
    authenticate,
    authorize(
        "Q002051",
        "Q002052",
        "Q002053", "Q002065"
    ),
    controller.getChiTiet
);


router.post(
    "/them-moi",
    authenticate,
    authorize(
        "Q002052",
        "Q002053"
    ),
    validate(
        createSchema
    ),
    controller.create
);


router.patch(
    "/cap-nhat/:id",
    authenticate,
    authorize("Q002053", "Q002065"),
    validate(updateSchema),
    controller.update
);


module.exports =
    router;
