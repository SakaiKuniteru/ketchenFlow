"use strict";

const { renderPage } = require("../utils/render-page.util");

class VeAnWebController {

    async layVeAn(
        req,
        res,
        next
    ) {
        try {
            return renderPage(
                req,
                res,
                "pages/ve-an/lay-ve-an",
                {
                    title: "Lấy vé ăn",
                    pageDescription: "Lấy vé ăn.",
                }
            );

        } catch (error) {
            next(error);
        }
    }

}

module.exports =
    new VeAnWebController();