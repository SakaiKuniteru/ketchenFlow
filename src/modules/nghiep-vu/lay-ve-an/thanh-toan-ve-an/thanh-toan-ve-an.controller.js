const service =
    require(
        "./thanh-toan-ve-an.service"
    );


const {
    successResponse
} = require(
    "../../../../utils/response.util"
);


class ThanhToanVeAnController {

    async getTongHop(
        req,
        res,
        next
    ) {

        try {

            const data =
                await service
                    .getTongHop(
                        req.query
                    );


            return successResponse(
                res,
                "Lấy danh sách giao dịch thanh toán vé ăn thành công.",
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

    async getDanhSachPhieu(
        req,
        res,
        next
    ) {

        try {

            const data =
                await service
                    .getDanhSachPhieu(
                        req.params
                            .phieuLayVeId
                    );


            return successResponse(
                res,
                "Lấy danh sách phiếu thành công.",
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
                await service
                    .getChiTiet(
                        id
                    );


            return successResponse(
                res,
                "Lấy chi tiết giao dịch thanh toán vé ăn thành công.",
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

    async inPhieuHoan(
        req,
        res,
        next
    ) {

        try {

            const data =
                await service
                    .getDuLieuInPhieuHoan(
                        req.params.id,
                        req.user?.taiKhoanId
                    );


            return successResponse(
                res,
                "Lấy dữ liệu in phiếu hoàn thành công.",
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
                await service
                    .create(
                        req.body,
                        req.user?.taiKhoanId
                    );


            return successResponse(
                res,
                "Tạo giao dịch thanh toán vé ăn thành công.",
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


    async taoQr(
        req,
        res,
        next
    ) {

        try {

            const data =
                await service
                    .taoQr(
                        req.body,
                        req.user?.taiKhoanId
                    );


            return successResponse(
                res,
                "Tạo giao dịch QR thành công.",
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

    async getQr(
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
                await service
                    .getQr(
                        id
                    );


            return successResponse(
                res,
                "Lấy mã QR thanh toán thành công.",
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

    async huyQr(
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
                await service
                    .huyQr(
                        id,
                        req.body,
                        req.user?.taiKhoanId
                    );


            return successResponse(
                res,
                "Hủy giao dịch QR thành công.",
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


    async xacNhan(
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
                await service
                    .xacNhan(
                        id,
                        req.body,
                        req.user?.taiKhoanId
                    );


            return successResponse(
                res,
                "Xác nhận thanh toán vé ăn thành công.",
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


    async hoanTien(
        req,
        res,
        next
    ) {

        try {

            const data =
                await service
                    .hoanTien(
                        req.body,
                        req.user?.taiKhoanId
                    );


            return successResponse(
                res,
                "Hoàn tiền vé ăn thành công.",
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

    async huyThanhToan(
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
                await service
                    .huyThanhToan(
                        id,
                        req.body,
                        req.user?.taiKhoanId
                    );


            return successResponse(
                res,
                "Hủy thanh toán vé ăn thành công.",
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

    async callback(
        req,
        res,
        next
    ) {

        try {

            const data =
                await service
                    .callback(
                        req.body
                    );


            return successResponse(
                res,
                "Xử lý callback thanh toán thành công.",
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
    new ThanhToanVeAnController();