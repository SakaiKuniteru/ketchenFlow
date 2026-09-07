const phieuLayVeAnService =
    require(
        "./phieu-lay-ve-an.service"
    );

const {
    successResponse
} = require(
    "../../../../utils/response.util"
);

class PhieuLayVeAnController {

    async getTongHop(
        req,
        res,
        next
    ) {

        try {

            const data =
                await phieuLayVeAnService
                    .getTongHop(
                        req.query
                    );


            return successResponse(
                res,
                "Lấy danh sách phiếu lấy vé ăn thành công.",
                data,
                200
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }

    }


    async getThucDonNgayHopLe(
        req,
        res,
        next
    ) {

        try {

            const data =
                await phieuLayVeAnService
                    .getThucDonNgayHopLe();


            return successResponse(
                res,
                "Lấy danh sách thực đơn ngày hợp lệ thành công.",
                data,
                200
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }

    }

    async getGiaVe(
        req,
        res,
        next
    ) {

        try {

            const data =
                await phieuLayVeAnService
                    .getGiaVePreview(
                        req.query
                    );


            return successResponse(
                res,
                "Lấy giá vé ăn thành công.",
                data,
                200
            );

        } catch (
            error
        ) {

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
            } =
                req.params;


            const data =
                await phieuLayVeAnService
                    .getChiTiet(
                        id
                    );


            return successResponse(
                res,
                "Lấy chi tiết phiếu lấy vé ăn thành công.",
                data,
                200
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }

    }


    async create(
        req,
        res,
        next
    ) {

        try {

            const data =
                await phieuLayVeAnService
                    .create(
                        req.body,
                        req.user?.taiKhoanId
                    );


            return successResponse(
                res,
                "Thêm phiếu lấy vé ăn thành công.",
                data,
                201
            );

        } catch (
            error
        ) {

            next(
                error
            );

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
            } =
                req.params;


            const data =
                await phieuLayVeAnService
                    .update(
                        id,
                        req.body
                    );


            return successResponse(
                res,
                "Cập nhật phiếu lấy vé ăn thành công.",
                data,
                200
            );

        } catch (
            error
        ) {

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
            } =
                req.params;


            const data =
                await phieuLayVeAnService
                    .huy(
                        id,
                        req.body,
                        req.user?.taiKhoanId
                    );


            return successResponse(
                res,
                "Hủy phiếu lấy vé ăn thành công.",
                data,
                200
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }

    }

    async inVe(
        req,
        res,
        next
    ) {

        try {

            const {
                id
            } =
                req.params;


            const data =
                await phieuLayVeAnService
                    .getDuLieuInVe(
                        id,
                        req.user?.taiKhoanId ||
                        req.user?.id
                    );


            return successResponse(
                res,
                "Lấy thông tin báo cáo vé ăn thành công.",
                data,
                200
            );

        } catch (
            error
        ) {

            next(
                error
            );

        }

    }

}


module.exports =
    new PhieuLayVeAnController();