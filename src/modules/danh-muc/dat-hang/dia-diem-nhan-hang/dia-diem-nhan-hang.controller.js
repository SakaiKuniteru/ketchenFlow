const diaDiemNhanHangService =
    require("./dia-diem-nhan-hang.service");

const {
    successResponse
} = require("../../../../utils/response.util");


class DiaDiemNhanHangController {

    async getTongHop(
        req,
        res,
        next
    ) {

        try {

            const data =
                await diaDiemNhanHangService
                    .getTongHop(
                        req.user.nhanVienId,
                        req.query
                    );

            return successResponse(
                res,
                "Lấy danh sách địa điểm nhận hàng thành công.",
                data,
                200
            );

        } catch (error) {

            next(error);

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

            const data =
                await diaDiemNhanHangService
                    .getChiTiet(
                        id,
                        req.user.nhanVienId
                    );

            return successResponse(
                res,
                "Lấy chi tiết địa điểm nhận hàng thành công.",
                data,
                200
            );

        } catch (error) {

            next(error);

        }

    }


    async create(
        req,
        res,
        next
    ) {

        try {

            const data =
                await diaDiemNhanHangService
                    .create(
                        req.user.nhanVienId,
                        req.body
                    );

            return successResponse(
                res,
                "Thêm địa điểm nhận hàng thành công.",
                data,
                201
            );

        } catch (error) {

            next(error);

        }

    }


    async update(
        req,
        res,
        next
    ) {

        try {

            const {
                id
            } = req.params;

            const data =
                await diaDiemNhanHangService
                    .update(
                        id,
                        req.user.nhanVienId,
                        req.body
                    );

            return successResponse(
                res,
                "Cập nhật địa điểm nhận hàng thành công.",
                data,
                200
            );

        } catch (error) {

            next(error);

        }

    }

}


module.exports =
    new DiaDiemNhanHangController();
