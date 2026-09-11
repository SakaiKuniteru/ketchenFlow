const enumService = require('./enum.service');

class EnumController {
    async get(req, res, next) {
        try {
            const { name } = req.query;

            const data = name ? enumService.get(name) : enumService.getAll();

            return res.json({
                success: true,

                message: 'Lấy dữ liệu thành công.',

                data
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EnumController();
