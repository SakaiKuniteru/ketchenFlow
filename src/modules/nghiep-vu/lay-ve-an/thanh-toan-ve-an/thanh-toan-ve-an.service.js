const crypto =
    require(
        "crypto"
    );


const pool =
    require(
        "../../../../config/database"
    );


const {
    phuongThucThanhToan:
        dsPhuongThucThanhToan,

    loaiGiaoDich:
        dsLoaiGiaoDich,

    trangThaiThanhToan:
        dsTrangThaiThanhToan,

    trangThaiPhieuThu:
        dsTrangThaiPhieuThu,

    trangThaiVe:
        dsTrangThaiVe

} = require(
    "../../../../constants/enums"
);


const ApiError =
    require(
        "../../../../utils/api-error"
    );


const repository =
    require(
        "./thanh-toan-ve-an.repository"
    );


class ThanhToanVeAnService {

    parseId(
        id
    ) {

        const value =
            Number(
                id
            );


        if (
            !Number.isInteger(
                value
            ) ||
            value <=
                0
        ) {

            throw new ApiError(
                400,
                "ID giao dịch thanh toán không hợp lệ."
            );

        }


        return value;

    }


    parseTaiKhoanId(
        id
    ) {

        const value =
            Number(
                id
            );


        if (
            !Number.isInteger(
                value
            ) ||
            value <=
                0
        ) {

            throw new ApiError(
                401,
                "Không xác định được tài khoản thực hiện."
            );

        }


        return value;

    }


    getEnumValue(
        danhSach,
        name
    ) {

        const item =
            danhSach.find(
                value =>
                    String(
                        value.name
                    )
                        .trim()
                        .toLowerCase() ===
                    String(
                        name
                    )
                        .trim()
                        .toLowerCase()
            );


        if (
            !item
        ) {

            throw new ApiError(
                500,
                `Không tìm thấy cấu hình enum ${name}.`
            );

        }


        return Number(
            item.value
        );

    }


    validateEnum(
        danhSach,
        value,
        message
    ) {

        const hopLe =
            danhSach.some(
                item =>
                    Number(
                        item.value
                    ) ===
                    Number(
                        value
                    )
            );


        if (
            !hopLe
        ) {

            throw new ApiError(
                400,
                message
            );

        }

    }


    async getTongHop(
        query
    ) {

        return await repository
            .getTongHop(
                query
            );

    }


    async getChiTiet(
        id
    ) {

        const thanhToanId =
            this.parseId(
                id
            );


        const data =
            await repository
                .getChiTiet(
                    thanhToanId
                );


        if (
            !data
        ) {

            throw new ApiError(
                404,
                "Giao dịch thanh toán không tồn tại."
            );

        }


        return data;

    }


    async getPhieuHopLe(
        id,
        db = pool
    ) {

        const phieu =
            await repository
                .getPhieuById(
                    id,
                    db
                );


        if (
            !phieu
        ) {

            throw new ApiError(
                404,
                "Phiếu lấy vé ăn không tồn tại."
            );

        }


        return phieu;

    }


    taoMaGiaoDich() {

        const now =
            new Date();


        const time =
            [
                now.getFullYear(),

                String(
                    now.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                ),

                String(
                    now.getDate()
                ).padStart(
                    2,
                    "0"
                ),

                String(
                    now.getHours()
                ).padStart(
                    2,
                    "0"
                ),

                String(
                    now.getMinutes()
                ).padStart(
                    2,
                    "0"
                ),

                String(
                    now.getSeconds()
                ).padStart(
                    2,
                    "0"
                )

            ].join(
                ""
            );


        const random =
            crypto
                .randomBytes(
                    4
                )
                .toString(
                    "hex"
                )
                .toUpperCase();


        return `TT${time}${random}`;

    }


    taoMaVe(
        phieuLayVeId,
        soThuTu
    ) {

        const random =
            crypto
                .randomBytes(
                    4
                )
                .toString(
                    "hex"
                )
                .toUpperCase();


        return `VE${phieuLayVeId}${String(
            soThuTu
        ).padStart(
            3,
            "0"
        )}${random}`;

    }


    taoQrToken() {

        return crypto
            .randomBytes(
                32
            )
            .toString(
                "hex"
            );

    }


    async sinhVeSauThanhToan(
        phieu,
        db
    ) {

        const daCoVe =
            await repository
                .existsVeTheoPhieu(
                    phieu.id,
                    db
                );


        if (
            daCoVe
        ) {

            return;

        }


        const trangThaiChuaSuDung =
            this.getEnumValue(
                dsTrangThaiVe,
                "Chưa sử dụng"
            );


        for (
            let soThuTu = 1;
            soThuTu <=
                Number(
                    phieu.so_luong
                );
            soThuTu++
        ) {

            await repository
                .createVe(
                    {

                        phieuLayVeId:
                            phieu.id,

                        thucDonNgayId:
                            phieu.thuc_don_ngay_id,

                        soThuTu,

                        maVe:
                            this.taoMaVe(
                                phieu.id,
                                soThuTu
                            ),

                        qrToken:
                            this.taoQrToken(),

                        trangThai:
                            trangThaiChuaSuDung

                    },
                    db
                );

        }

    }


    async hoanTatThanhToan(
        thanhToan,
        nguoiXacNhanId,
        data,
        db
    ) {

        const trangThaiThanhCong =
            this.getEnumValue(
                dsTrangThaiThanhToan,
                "Thành công"
            );


        const daThanhToan =
            await repository
                .existsThanhToanThanhCong(
                    thanhToan.phieuLayVeId,
                    db
                );


        if (
            daThanhToan &&
            Number(
                thanhToan.trangThai
            ) !==
                trangThaiThanhCong
        ) {

            throw new ApiError(
                409,
                "Phiếu đã có giao dịch thanh toán thành công."
            );

        }


        const phieu =
            await this.getPhieuHopLe(
                thanhToan.phieuLayVeId,
                db
            );


        await repository
            .updateTrangThai(
                thanhToan.id,
                {

                    trangThai:
                        trangThaiThanhCong,

                    maThamChieu:
                        data.maThamChieu ||
                        null,

                    maChuanChi:
                        data.maChuanChi ||
                        null,

                    noiDungLoi:
                        null,

                    nguoiXacNhanId

                },
                db
            );


        await repository
            .updatePhieuThanhToan(
                phieu.id,
                thanhToan.phuongThuc,
                nguoiXacNhanId,
                db
            );


        await repository
            .tangVoucherDaSuDung(
                phieu.id,
                db
            );


        await this.sinhVeSauThanhToan(
            phieu,
            db
        );

    }


    async create(
        data,
        nguoiKhoiTaoId
    ) {

        const taiKhoanId =
            this.parseTaiKhoanId(
                nguoiKhoiTaoId
            );


        const phuongThuc =
            Number(
                data.phuongThuc
            );


        this.validateEnum(
            dsPhuongThucThanhToan,
            phuongThuc,
            "Phương thức thanh toán không hợp lệ."
        );


        const phuongThucQr =
            this.getEnumValue(
                dsPhuongThucThanhToan,
                "QR Code"
            );


        if (
            phuongThuc ===
            phuongThucQr
        ) {

            throw new ApiError(
                400,
                "Thanh toán QR phải sử dụng API tạo QR."
            );

        }


        const phieuLayVeId =
            Number(
                data.phieuLayVeId
            );


        const phieu =
            await this.getPhieuHopLe(
                phieuLayVeId
            );


        const daThanhToan =
            await repository
                .existsThanhToanThanhCong(
                    phieuLayVeId
                );


        if (
            daThanhToan
        ) {

            throw new ApiError(
                409,
                "Phiếu đã được thanh toán."
            );

        }


        const loaiThanhToan =
            this.getEnumValue(
                dsLoaiGiaoDich,
                "Thanh toán"
            );


        const choXuLy =
            this.getEnumValue(
                dsTrangThaiThanhToan,
                "Chờ xử lý"
            );


        const id =
            await repository
                .create(
                    {

                        phieuLayVeId,

                        loaiGiaoDich:
                            loaiThanhToan,

                        phuongThuc,

                        soTien:
                            Number(
                                phieu.thanh_tien
                            ),

                        maGiaoDich:
                            this.taoMaGiaoDich(),

                        maThamChieu:
                            data.maThamChieu
                                ?.trim() ||
                            null,

                        maChuanChi:
                            data.maChuanChi
                                ?.trim() ||
                            null,

                        trangThai:
                            choXuLy,

                        noiDungLoi:
                            null,

                        nguoiKhoiTaoId:
                            taiKhoanId,

                        nguoiXacNhanId:
                            null,

                        thoiGianThanhToan:
                            null

                    }
                );


        return await repository
            .getChiTiet(
                id
            );

    }


    async taoQr(
        data,
        nguoiKhoiTaoId
    ) {

        const taiKhoanId =
            this.parseTaiKhoanId(
                nguoiKhoiTaoId
            );


        const phieuLayVeId =
            Number(
                data.phieuLayVeId
            );


        const phieu =
            await this.getPhieuHopLe(
                phieuLayVeId
            );


        const daThanhToan =
            await repository
                .existsThanhToanThanhCong(
                    phieuLayVeId
                );


        if (
            daThanhToan
        ) {

            throw new ApiError(
                409,
                "Phiếu đã được thanh toán."
            );

        }


        const phuongThucQr =
            this.getEnumValue(
                dsPhuongThucThanhToan,
                "QR Code"
            );


        const loaiThanhToan =
            this.getEnumValue(
                dsLoaiGiaoDich,
                "Thanh toán"
            );


        const dangXuLy =
            this.getEnumValue(
                dsTrangThaiThanhToan,
                "Đang xử lý"
            );


        const maGiaoDich =
            this.taoMaGiaoDich();


        /*
         * Sau này khi tích hợp ngân hàng/payment gateway:
         *
         * const ketQuaQr =
         *     await paymentService.createQr({
         *         maGiaoDich,
         *         soTien: phieu.thanh_tien
         *     });
         *
         * Hiện tại chỉ tạo transaction DB.
         */


        const id =
            await repository
                .create(
                    {

                        phieuLayVeId,

                        loaiGiaoDich:
                            loaiThanhToan,

                        phuongThuc:
                            phuongThucQr,

                        soTien:
                            Number(
                                phieu.thanh_tien
                            ),

                        maGiaoDich,

                        maThamChieu:
                            null,

                        maChuanChi:
                            null,

                        trangThai:
                            dangXuLy,

                        noiDungLoi:
                            null,

                        nguoiKhoiTaoId:
                            taiKhoanId,

                        nguoiXacNhanId:
                            null,

                        thoiGianThanhToan:
                            null

                    }
                );


        const trangThaiTaoQr =
            this.getEnumValue(
                dsTrangThaiPhieuThu,
                "Tạo QR"
            );


        await repository
            .updateTrangThaiPhieu(
                phieuLayVeId,
                trangThaiTaoQr
            );


        const thanhToan =
            await repository
                .getChiTiet(
                    id
                );


        return {

            ...thanhToan,

            qrData: {
                maGiaoDich,
                soTien:
                    Number(
                        phieu.thanh_tien
                    )
            }

        };

    }


    async huyQr(
        id,
        data,
        nguoiXacNhanId
    ) {

        const thanhToanId =
            this.parseId(
                id
            );


        const taiKhoanId =
            this.parseTaiKhoanId(
                nguoiXacNhanId
            );


        const thanhToan =
            await this.getChiTiet(
                thanhToanId
            );


        const phuongThucQr =
            this.getEnumValue(
                dsPhuongThucThanhToan,
                "QR Code"
            );


        if (
            Number(
                thanhToan.phuongThuc
            ) !==
            phuongThucQr
        ) {

            throw new ApiError(
                400,
                "Giao dịch không phải thanh toán QR."
            );

        }


        const thanhCong =
            this.getEnumValue(
                dsTrangThaiThanhToan,
                "Thành công"
            );


        if (
            Number(
                thanhToan.trangThai
            ) ===
            thanhCong
        ) {

            throw new ApiError(
                400,
                "Giao dịch đã thành công nên không thể hủy QR."
            );

        }


        const daHuy =
            this.getEnumValue(
                dsTrangThaiThanhToan,
                "Đã huỷ"
            );


        const client =
            await pool.connect();


        try {

            await client.query(
                "BEGIN"
            );


            await repository
                .updateTrangThai(
                    thanhToanId,
                    {

                        trangThai:
                            daHuy,

                        maThamChieu:
                            null,

                        maChuanChi:
                            null,

                        noiDungLoi:
                            data.noiDung
                                ?.trim() ||
                            null,

                        nguoiXacNhanId:
                            taiKhoanId

                    },
                    client
                );

                const trangThaiBanDau =
                    0;


                this.validateEnum(
                    dsTrangThaiPhieuThu,
                    trangThaiBanDau,
                    "Trạng thái ban đầu của phiếu không hợp lệ."
                );


                await repository
                    .updateTrangThaiPhieu(
                        thanhToan.phieuLayVeId,
                        trangThaiBanDau,
                        client
                    );

            await client.query(
                "COMMIT"
            );


            return await repository
                .getChiTiet(
                    thanhToanId
                );

        } catch (
            error
        ) {

            await client.query(
                "ROLLBACK"
            );


            throw error;

        } finally {

            client.release();

        }

    }


    async xacNhan(
        id,
        data,
        nguoiXacNhanId
    ) {

        const thanhToanId =
            this.parseId(
                id
            );


        const taiKhoanId =
            this.parseTaiKhoanId(
                nguoiXacNhanId
            );


        const thanhToan =
            await this.getChiTiet(
                thanhToanId
            );


        const client =
            await pool.connect();


        try {

            await client.query(
                "BEGIN"
            );


            await this.hoanTatThanhToan(
                thanhToan,
                taiKhoanId,
                data,
                client
            );


            await client.query(
                "COMMIT"
            );


            return await repository
                .getChiTiet(
                    thanhToanId
                );

        } catch (
            error
        ) {

            await client.query(
                "ROLLBACK"
            );


            throw error;

        } finally {

            client.release();

        }

    }


    async hoanTien(
        data,
        nguoiKhoiTaoId
    ) {

        const taiKhoanId =
            this.parseTaiKhoanId(
                nguoiKhoiTaoId
            );


        const phieuLayVeId =
            Number(
                data.phieuLayVeId
            );


        const phieu =
            await this.getPhieuHopLe(
                phieuLayVeId
            );


        const daThanhToan =
            await repository
                .existsThanhToanThanhCong(
                    phieuLayVeId
                );


        if (
            !daThanhToan
        ) {

            throw new ApiError(
                400,
                "Phiếu chưa có giao dịch thanh toán thành công."
            );

        }


        const tongDaHoan =
            await repository
                .getTongDaHoan(
                    phieuLayVeId
                );


        const tongThanhToan =
            Number(
                phieu.thanh_tien
            );


        const conLai =
            Math.max(
                tongThanhToan -
                tongDaHoan,
                0
            );

        const soLuongHoan =
            Number(
                data.soLuongHoan
            );


        if (
            !Number.isInteger(
                soLuongHoan
            ) ||
            soLuongHoan <=
                0
        ) {

            throw new ApiError(
                400,
                "Số lượng hoàn không hợp lệ."
            );

        }


        const tongSoLuong =
            Number(
                phieu.so_luong
            );


        if (
            soLuongHoan >
            tongSoLuong
        ) {

            throw new ApiError(
                400,
                "Số lượng hoàn không được lớn hơn số lượng vé."
            );

        }


        const lyDoHoan =
            String(
                data.lyDoHoan ||
                ""
            )
                .trim();


        if (
            !lyDoHoan
        ) {

            throw new ApiError(
                400,
                "Lý do hoàn là bắt buộc."
            );

        }

        if (
            conLai <=
            0
        ) {

            throw new ApiError(
                400,
                "Phiếu đã được hoàn toàn bộ số tiền."
            );

        }

        const soTienMoiVe =
            tongThanhToan /
            tongSoLuong;


        const soTien =
            Number(
                (
                    soTienMoiVe *
                    soLuongHoan
                )
                    .toFixed(
                        5
                    )
            );
        if (
            soTien >
            conLai
        ) {

            throw new ApiError(
                400,
                "Số tiền hoàn vượt quá số tiền còn có thể hoàn."
            );

        }


        const phuongThuc =
            Number(
                data.phuongThuc
            );


        this.validateEnum(
            dsPhuongThucThanhToan,
            phuongThuc,
            "Phương thức hoàn tiền không hợp lệ."
        );


        const loaiHoanTien =
            this.getEnumValue(
                dsLoaiGiaoDich,
                "Hoàn tiền"
            );


        const thanhCong =
            this.getEnumValue(
                dsTrangThaiThanhToan,
                "Thành công"
            );


        const client =
            await pool.connect();


        try {

            await client.query(
                "BEGIN"
            );


            const id =
                await repository
                    .create(
                        {

                            phieuLayVeId,

                            loaiGiaoDich:
                                loaiHoanTien,

                            phuongThuc,

                            soTien,

                            maGiaoDich:
                                this.taoMaGiaoDich(),

                            maThamChieu:
                                data.maThamChieu
                                    ?.trim() ||
                                null,

                            maChuanChi:
                                data.maChuanChi
                                    ?.trim() ||
                                null,

                            trangThai:
                                thanhCong,

                            noiDungLoi:
                                null,

                            nguoiKhoiTaoId:
                                taiKhoanId,

                            nguoiXacNhanId:
                                taiKhoanId,

                            thoiGianThanhToan:
                                new Date()

                        },
                        client
                    );


            const tongSauHoan =
                tongDaHoan +
                soTien;


            if (
                tongSauHoan >=
                tongThanhToan
            ) {

                const trangThaiDaHoan =
                    this.getEnumValue(
                        dsTrangThaiPhieuThu,
                        "Đã hoàn"
                    );


                await repository
                    .updateTrangThaiPhieu(
                        phieuLayVeId,
                        trangThaiDaHoan,
                        client
                    );


                await repository
                    .giamVoucherDaSuDung(
                        phieuLayVeId,
                        client
                    );

                await repository
                    .huyVeTheoPhieu(
                        phieuLayVeId,
                        taiKhoanId,
                        lyDoHoan,
                        client
                    );

            }


            await client.query(
                "COMMIT"
            );


            return await repository
                .getChiTiet(
                    id
                );

        } catch (
            error
        ) {

            await client.query(
                "ROLLBACK"
            );


            throw error;

        } finally {

            client.release();

        }

    }


    async callback(
        data
    ) {

        const thanhToan =
            await repository
                .getByMaGiaoDich(
                    data.maGiaoDich
                );


        if (
            !thanhToan
        ) {

            throw new ApiError(
                404,
                "Không tìm thấy giao dịch thanh toán."
            );

        }


        const thanhCong =
            this.getEnumValue(
                dsTrangThaiThanhToan,
                "Thành công"
            );


        const thatBai =
            this.getEnumValue(
                dsTrangThaiThanhToan,
                "Thất bại"
            );


        const trangThaiCallback =
            Number(
                data.trangThai
            );


        if (
            trangThaiCallback !==
                thanhCong &&
            trangThaiCallback !==
                thatBai
        ) {

            throw new ApiError(
                400,
                "Trạng thái callback không hợp lệ."
            );

        }


        const client =
            await pool.connect();


        try {

            await client.query(
                "BEGIN"
            );


            if (
                trangThaiCallback ===
                thanhCong
            ) {

                await this.hoanTatThanhToan(
                    thanhToan,
                    null,
                    data,
                    client
                );

            } else {

                await repository
                    .updateTrangThai(
                        thanhToan.id,
                        {

                            trangThai:
                                thatBai,

                            maThamChieu:
                                data.maThamChieu ||
                                null,

                            maChuanChi:
                                data.maChuanChi ||
                                null,

                            noiDungLoi:
                                data.noiDungLoi ||
                                null,

                            nguoiXacNhanId:
                                null

                        },
                        client
                    );

            }


            await client.query(
                "COMMIT"
            );


            return await repository
                .getChiTiet(
                    thanhToan.id
                );

        } catch (
            error
        ) {

            await client.query(
                "ROLLBACK"
            );


            throw error;

        } finally {

            client.release();

        }

    }

}


module.exports =
    new ThanhToanVeAnService();