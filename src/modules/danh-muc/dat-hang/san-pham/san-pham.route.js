const express =
    require("express");

const multer =
    require("multer");

const validate =
    require(
        "../../../../middlewares/validate.middleware"
    );

const authenticate =
    require(
        "../../../../middlewares/authenticate.middleware"
    );

const authorize =
    require(
        "../../../../middlewares/authorize.middleware"
    );

const controller =
    require(
        "./san-pham.controller"
    );

const excelController =
    require(
        "./san-pham.excel"
    );

const {
    createSchema,
    updateSchema
} = require(
    "./san-pham.validation"
);


const router =
    express.Router();


const upload =
    multer({

        storage:
            multer.memoryStorage(),

        limits: {

            fileSize:
                10 * 1024 * 1024

        }

    });


router.get(
    "/tong-hop",
    authenticate,
    authorize(
        "Q002021"
    ),
    controller.getTongHop
);


router.get(
    "/xuat-du-lieu",
    authenticate,
    authorize(
        "Q100001"
    ),
    excelController.exportData
);


router.post(
    "/import-du-lieu",
    authenticate,
    authorize(
        "Q100002"
    ),
    upload.single(
        "file"
    ),
    excelController.importData
);


router.get(
    "/:id",
    authenticate,
    authorize(
        "Q002021",
        "Q002022",
        "Q002023"
    ),
    controller.getChiTiet
);


router.post(
    "/them-moi",
    authenticate,
    authorize(
        "Q002022",
        "Q002023"
    ),
    validate(
        createSchema
    ),
    controller.create
);


router.patch(
    "/cap-nhat/:id",
    authenticate,
    authorize(
        "Q002023"
    ),
    validate(
        updateSchema
    ),
    controller.update
);


module.exports =
    router;