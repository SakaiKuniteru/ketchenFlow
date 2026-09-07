"use strict";

require("dotenv").config();

const app = require("./app");
const env = require("./config/env");
const libreOffice = require("./services/in-bao-cao/in-bao-cao.libreoffice");

async function startServer() {
    try {
        const start = performance.now();

        await libreOffice.start();

        const duration = performance.now() - start;

        console.log(
            `LibreOffice report worker ready in ${duration.toFixed(
                0
            )} ms`
        );
    } catch (error) {
        console.error(
            "Không thể warm LibreOffice:",
            error
        );
    }

    app.listen(
        env.port,
        () => {
            console.log(
                `KitchenFlow running at port ${env.port}`
            );
        }
    );
}

startServer();