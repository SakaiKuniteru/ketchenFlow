"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const dir = __dirname;

const files = fs.readdirSync(dir)
    .filter(file =>
        file.startsWith("tao-mau-") &&
        file.endsWith(".js") &&
        file !== "tao-tat-ca-mau.js"
    )
    .sort();

for (const file of files) {

    console.log(`\n==============================`);
    console.log(`Đang tạo: ${file}`);
    console.log(`==============================`);

    const result = spawnSync(
        "node",
        [path.join(dir, file)],
        {
            stdio: "inherit"
        }
    );

    if (result.status !== 0) {
        console.error(`Lỗi: ${file}`);
    }

}

console.log("\nHoàn thành.");