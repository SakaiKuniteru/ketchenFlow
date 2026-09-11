function sendExcel(res, result, statusCode = 200) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);

    return res.status(statusCode).send(result.buffer);
}

module.exports = {
    sendExcel
};
