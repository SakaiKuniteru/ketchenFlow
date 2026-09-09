"use strict";

const crypto = require("crypto");

function generateOrderCode() {
    const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `DH${date}${suffix}`;
}

module.exports = { generateOrderCode };
