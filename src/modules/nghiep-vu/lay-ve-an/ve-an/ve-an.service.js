const pool = require("../../../../config/database");

const {
    trangThaiVe: dsTrangThaiVe
} = require("../../../../constants/enums");

const ApiError = require("../../../../utils/api-error");
const repository = require("./ve-an.repository");

class VeAnService {
    parseId(id) {
        const value = Number(id);

        if (
            !Number.isInteger(value) ||
            value <= 0
        ) {
            throw new ApiError(
                400,
                "ID vé ăn không hợp lệ."
            );
        }

        return value;
    }

    parseTaiKhoanId(id) {
        const value = Number(id);

        if (
            !Number.isInteger(value) ||
            value <= 0
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
        const item = danhSach.find(
            value =>
                String(value.name)
                    .trim()
                    .toLowerCase() ===
                String(name)
                    .trim()
                    .toLowerCase()
        );

        if (!item) {
            throw new ApiError(
                500,
                `Không tìm thấy cấu hình enum ${name}.`
            );
        }

        return Number(item.value);
    }

    validateTrangThaiVe(
        value
    ) {

        const values =
            (
                Array.isArray(
                    value
                )
                    ? value
                    : String(
                        value ??
                        ""
                    )
                        .split(
                            ","
                        )
            )
                .flatMap(
                    item =>
                        String(
                            item
                        )
                            .split(
                                ","
                            )
                )
                .map(
                    item =>
                        Number(
                            item
                        )
                )
                .filter(
                    item =>
                        Number.isFinite(
                            item
                        )
                );


        const hopLe =
            values.length >
                0 &&
            values.every(
                current =>
                    dsTrangThaiVe.some(
                        item =>
                            Number(
                                item.value
                            ) ===
                            current
                    )
            );


        if (
            !hopLe
        ) {

            throw new ApiError(
                400,
                "Trạng thái vé không hợp lệ."
            );

        }

    }

    async getTongHop(query) {
        if (
            query.trangThai !==
            undefined
        ) {
            this.validateTrangThaiVe(
                query.trangThai
            );
        }

        return await repository
            .getTongHop(
                query
            );
    }

    async getChiTiet(id) {
        const veAnId = this.parseId(id);

        const ve = await repository
            .getChiTiet(
                veAnId
            );

        if (!ve) {
            throw new ApiError(
                404,
                "Vé ăn không tồn tại."
            );
        }

        return ve;
    }

    async getVeTheoQr(
        qrToken,
        db = pool
    ) {
        const token = String(
            qrToken ||
            ""
        ).trim();

        if (!token) {
            throw new ApiError(
                400,
                "QR token không hợp lệ."
            );
        }

        const ve = await repository
            .getByQrToken(
                token,
                db
            );

        if (!ve) {
            throw new ApiError(
                404,
                "Không tìm thấy vé ăn."
            );
        }

        return ve;
    }

    getThoiGianBatDauBuaAn(ve) {
        if (
            !ve.ngay ||
            !ve.thoiGianBatDau
        ) {
            return null;
        }

        const ngay = String(
            ve.ngay
        ).slice(
            0,
            10
        );

        const gio = String(
            ve.thoiGianBatDau
        );

        const value = new Date(
            `${ngay}T${gio}`
        );

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {
            return null;
        }

        return value;
    }

    getThoiGianKetThucBuaAn(ve) {
        if (
            !ve.ngay ||
            !ve.thoiGianKetThuc
        ) {
            return null;
        }

        const ngay = String(
            ve.ngay
        ).slice(
            0,
            10
        );

        const gio = String(
            ve.thoiGianKetThuc
        );

        const value = new Date(
            `${ngay}T${gio}`
        );

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {
            return null;
        }

        return value;
    }

    async capNhatHetHanNeuCan(
        ve,
        db = pool
    ) {
        const chuaSuDung = this.getEnumValue(
            dsTrangThaiVe,
            "Chưa sử dụng"
        );

        if (
            Number(ve.trangThai) !==
            chuaSuDung
        ) {
            return ve;
        }

        const ketThuc = this.getThoiGianKetThucBuaAn(
            ve
        );

        if (!ketThuc) {
            return ve;
        }

        if (
            new Date() <=
            ketThuc
        ) {
            return ve;
        }

        const hetHan = this.getEnumValue(
            dsTrangThaiVe,
            "Đã hết hạn"
        );

        await repository
            .hetHan(
                ve.id,
                hetHan,
                db
            );

        return await repository
            .getChiTiet(
                ve.id,
                db
            );
    }

    async kiemTra(data) {
        let ve = await this.getVeTheoQr(
            data.qrToken
        );

        ve = await this.capNhatHetHanNeuCan(
            ve
        );

        const chuaSuDung = this.getEnumValue(
            dsTrangThaiVe,
            "Chưa sử dụng"
        );

        const daSuDung = this.getEnumValue(
            dsTrangThaiVe,
            "Đã sử dụng"
        );

        const daHuy = this.getEnumValue(
            dsTrangThaiVe,
            "Đã huỷ"
        );

        const hetHan = this.getEnumValue(
            dsTrangThaiVe,
            "Đã hết hạn"
        );

        let hopLe = false;
        let message = "";

        if (
            Number(ve.trangThai) ===
            chuaSuDung
        ) {
            const batDau = this.getThoiGianBatDauBuaAn(
                ve
            );

            if (
                batDau &&
                new Date() <
                    batDau
            ) {
                message = "Vé chưa đến thời gian sử dụng.";
            } else {
                hopLe = true;
                message = "Vé hợp lệ.";
            }
        } else if (
            Number(ve.trangThai) ===
            daSuDung
        ) {
            message = "Vé đã được sử dụng.";
        } else if (
            Number(ve.trangThai) ===
            daHuy
        ) {
            message = "Vé đã bị hủy.";
        } else if (
            Number(ve.trangThai) ===
            hetHan
        ) {
            message = "Vé đã hết hạn.";
        } else {
            message = "Trạng thái vé không hợp lệ.";
        }

        return {
            hopLe,
            message,
            ve
        };
    }

    async xacNhanSuDung(
        data,
        nguoiXacNhanId
    ) {
        const taiKhoanId = this.parseTaiKhoanId(
            nguoiXacNhanId
        );

        const client = await pool.connect();

        try {
            await client.query(
                "BEGIN"
            );

            let ve = await this.getVeTheoQr(
                data.qrToken,
                client
            );

            ve = await this.capNhatHetHanNeuCan(
                ve,
                client
            );

            const chuaSuDung = this.getEnumValue(
                dsTrangThaiVe,
                "Chưa sử dụng"
            );

            if (
                Number(ve.trangThai) !==
                chuaSuDung
            ) {
                throw new ApiError(
                    400,
                    "Vé không ở trạng thái có thể sử dụng."
                );
            }

            const batDau = this.getThoiGianBatDauBuaAn(
                ve
            );

            if (
                batDau &&
                new Date() <
                    batDau
            ) {
                throw new ApiError(
                    400,
                    "Vé chưa đến thời gian sử dụng."
                );
            }

            const ketThuc = this.getThoiGianKetThucBuaAn(
                ve
            );

            if (
                ketThuc &&
                new Date() >
                    ketThuc
            ) {
                const hetHan = this.getEnumValue(
                    dsTrangThaiVe,
                    "Đã hết hạn"
                );

                await repository
                    .hetHan(
                        ve.id,
                        hetHan,
                        client
                    );

                throw new ApiError(
                    400,
                    "Vé đã hết thời gian sử dụng."
                );
            }

            const daSuDung = this.getEnumValue(
                dsTrangThaiVe,
                "Đã sử dụng"
            );

            const ketQua = await repository
                .xacNhanSuDung(
                    ve.id,
                    taiKhoanId,
                    daSuDung,
                    client
                );

            if (!ketQua) {
                throw new ApiError(
                    404,
                    "Vé ăn không tồn tại."
                );
            }

            await client.query(
                "COMMIT"
            );

            return await repository
                .getChiTiet(
                    ve.id
                );
        } catch (error) {
            await client.query(
                "ROLLBACK"
            );

            throw error;
        } finally {
            client.release();
        }
    }

    async xacNhanSuDungHangLoat(
        data,
        nguoiXacNhanId
    ) {

        const taiKhoanId =
            this.parseTaiKhoanId(
                nguoiXacNhanId
            );


        const thanhCong =
            [];

        const thatBai =
            [];


        for (
            const rawId
            of data.ids
        ) {

            const id =
                this.parseId(
                    rawId
                );


            try {

                const ve =
                    await this.getChiTiet(
                        id
                    );


                if (
                    !ve?.qrToken
                ) {

                    throw new ApiError(
                        400,
                        "Vé không có QR token."
                    );

                }


                await this.xacNhanSuDung(
                    {
                        qrToken:
                            ve.qrToken
                    },
                    taiKhoanId
                );


                thanhCong.push(
                    id
                );

            } catch (
                error
            ) {

                thatBai.push({

                    id,

                    message:
                        error?.message ||
                        "Không thể xác nhận sử dụng vé."

                });

            }

        }


        return {

            tongSo:
                data.ids.length,

            soThanhCong:
                thanhCong.length,

            soThatBai:
                thatBai.length,

            thanhCong,

            thatBai

        };

    }

    async huy(
        id,
        data,
        nguoiHuyId
    ) {
        const veAnId = this.parseId(
            id
        );

        const taiKhoanId = this.parseTaiKhoanId(
            nguoiHuyId
        );

        const ve = await this.getChiTiet(
            veAnId
        );

        const chuaSuDung = this.getEnumValue(
            dsTrangThaiVe,
            "Chưa sử dụng"
        );

        if (
            Number(ve.trangThai) !==
            chuaSuDung
        ) {
            throw new ApiError(
                400,
                "Chỉ được hủy vé chưa sử dụng."
            );
        }

        const daHuy = this.getEnumValue(
            dsTrangThaiVe,
            "Đã huỷ"
        );

        const ketQua = await repository
            .huy(
                veAnId,
                taiKhoanId,
                data.lyDoHuy.trim(),
                daHuy
            );

        if (!ketQua) {
            throw new ApiError(
                404,
                "Vé ăn không tồn tại."
            );
        }

        return await repository
            .getChiTiet(
                veAnId
            );
    }

    async huyHangLoat(
        data,
        nguoiHuyId
    ) {

        const taiKhoanId =
            this.parseTaiKhoanId(
                nguoiHuyId
            );


        const thanhCong =
            [];

        const thatBai =
            [];


        for (
            const rawId
            of data.ids
        ) {

            const id =
                this.parseId(
                    rawId
                );


            try {

                await this.huy(
                    id,
                    {
                        lyDoHuy:
                            data.lyDoHuy
                    },
                    taiKhoanId
                );


                thanhCong.push(
                    id
                );

            } catch (
                error
            ) {

                thatBai.push({

                    id,

                    message:
                        error?.message ||
                        "Không thể hủy vé."

                });

            }

        }


        return {

            tongSo:
                data.ids.length,

            soThanhCong:
                thanhCong.length,

            soThatBai:
                thatBai.length,

            thanhCong,

            thatBai

        };

    }

    async huyXacNhan(
        id
    ) {

        const veAnId =
            this.parseId(
                id
            );


        const ve =
            await this.getChiTiet(
                veAnId
            );


        const daSuDung =
            this.getEnumValue(
                dsTrangThaiVe,
                "Đã sử dụng"
            );


        if (
            Number(
                ve.trangThai
            ) !==
            daSuDung
        ) {

            throw new ApiError(
                400,
                "Chỉ được hủy xác nhận vé đã sử dụng."
            );

        }


        const chuaSuDung =
            this.getEnumValue(
                dsTrangThaiVe,
                "Chưa sử dụng"
            );


        const result =
            await repository
                .huyXacNhan(
                    veAnId,
                    daSuDung,
                    chuaSuDung
                );


        if (
            !result
        ) {

            throw new ApiError(
                409,
                "Trạng thái vé đã thay đổi, vui lòng tải lại dữ liệu."
            );

        }


        return await repository
            .getChiTiet(
                veAnId
            );

    }

    async huyHuy(
        id
    ) {

        const veAnId =
            this.parseId(
                id
            );


        const ve =
            await this.getChiTiet(
                veAnId
            );


        const daHuy =
            this.getEnumValue(
                dsTrangThaiVe,
                "Đã huỷ"
            );


        if (
            Number(
                ve.trangThai
            ) !==
            daHuy
        ) {

            throw new ApiError(
                400,
                "Chỉ được hủy hủy đối với vé đã hủy."
            );

        }


        const chuaSuDung =
            this.getEnumValue(
                dsTrangThaiVe,
                "Chưa sử dụng"
            );


        const result =
            await repository
                .huyHuy(
                    veAnId,
                    daHuy,
                    chuaSuDung
                );


        if (
            !result
        ) {

            throw new ApiError(
                409,
                "Trạng thái vé đã thay đổi, vui lòng tải lại dữ liệu."
            );

        }


        return await repository
            .getChiTiet(
                veAnId
            );

    }

    async huyXacNhanHangLoat(
        data
    ) {

        const thanhCong =
            [];

        const thatBai =
            [];


        for (
            const rawId
            of data.ids
        ) {

            const id =
                this.parseId(
                    rawId
                );


            try {

                await this.huyXacNhan(
                    id
                );


                thanhCong.push(
                    id
                );

            } catch (
                error
            ) {

                thatBai.push({
                    id,
                    message:
                        error?.message ||
                        "Không thể hủy xác nhận vé."
                });

            }

        }


        return {
            tongSo:
                data.ids.length,

            soThanhCong:
                thanhCong.length,

            soThatBai:
                thatBai.length,

            thanhCong,
            thatBai
        };

    }

    async huyHuyHangLoat(
        data
    ) {

        const thanhCong =
            [];

        const thatBai =
            [];


        for (
            const rawId
            of data.ids
        ) {

            const id =
                this.parseId(
                    rawId
                );


            try {

                await this.huyHuy(
                    id
                );


                thanhCong.push(
                    id
                );

            } catch (
                error
            ) {

                thatBai.push({
                    id,
                    message:
                        error?.message ||
                        "Không thể hủy trạng thái hủy của vé."
                });

            }

        }


        return {
            tongSo:
                data.ids.length,

            soThanhCong:
                thanhCong.length,

            soThatBai:
                thatBai.length,

            thanhCong,
            thatBai
        };

    }
}

module.exports = new VeAnService();