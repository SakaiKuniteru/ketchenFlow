"use strict";

const path =
    require(
        "path"
    );


const STORAGE_ROOT =
    path.resolve(
        process.env
            .FILE_STORAGE_ROOT ||
        path.resolve(
            __dirname,
            "../public"
        )
    );


module.exports = {
    STORAGE_ROOT
};