const service = require("./ve-an.service");

const {
    successResponse
} = require("../../../../utils/response.util");

class VeAnController {
    async getTongHop(
        req,
        res,
        next
    ) {
        try {
            const data = await service
                .getTongHop(
                    req.query
                );

            return successResponse(
                res,
                "Lấy danh sách vé ăn thành công.",
                data,
                200
            );
        } catch (error) {
            next(
                error
            );
        }
    }

    async getChiTiet(
        req,
        res,
        next
    ) {
        try {
            const {
                id
            } = req.params;

            const data = await service
                .getChiTiet(
                    id
                );

            return successResponse(
                res,
                "Lấy chi tiết vé ăn thành công.",
                data,
                200
            );
        } catch (error) {
            next(
                error
            );
        }
    }

    async kiemTra(
        req,
        res,
        next
    ) {
        try {
            const data = await service
                .kiemTra(
                    req.body
                );

            return successResponse(
                res,
                "Kiểm tra vé ăn thành công.",
                data,
                200
            );
        } catch (error) {
            next(
                error
            );
        }
    }

    async xacNhanSuDung(
        req,
        res,
        next
    ) {
        try {
            const data = await service
                .xacNhanSuDung(
                    req.body,
                    req.user?.taiKhoanId
                );

            return successResponse(
                res,
                "Xác nhận sử dụng vé ăn thành công.",
                data,
                200
            );
        } catch (error) {
            next(
                error
            );
        }
    }

    async huy(
        req,
        res,
        next
    ) {
        try {
            const {
                id
            } = req.params;

            const data = await service
                .huy(
                    id,
                    req.body,
                    req.user?.taiKhoanId
                );

            return successResponse(
                res,
                "Hủy vé ăn thành công.",
                data,
                200
            );
        } catch (error) {
            next(
                error
            );
        }
    }
}

module.exports = new VeAnController();