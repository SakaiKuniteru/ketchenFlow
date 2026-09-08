const pool = require("../../../../config/database");

const {
    loaiMienGiam: dsLoaiMienGiam,
    trangThaiPhieuThu: dsTrangThaiPhieuThu
} = require("../../../../constants/enums");

const ApiError = require("../../../../utils/api-error");
const repository = require("./phieu-lay-ve-mien-giam.repository");

class PhieuLayVeMienGiamService {
    parseId(id) {
        const value = Number(id);

        if (
            !Number.isInteger(value) ||
            value <= 0
        ) {
            throw new ApiError(
                400,
                "ID miễn giảm không hợp lệ."
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

    validateLoaiMienGiam(value) {
        const hopLe = dsLoaiMienGiam.some(
            item =>
                Number(item.value) ===
                Number(value)
        );

        if (!hopLe) {
            throw new ApiError(
                400,
                "Loại miễn giảm không hợp lệ."
            );
        }
    }

    validateTrangThaiPhieu(value) {
        const hopLe = dsTrangThaiPhieuThu.some(
            item =>
                Number(item.value) ===
                Number(value)
        );

        if (!hopLe) {
            throw new ApiError(
                400,
                "Trạng thái phiếu không hợp lệ."
            );
        }
    }

    validatePhieuChoPhepSua(phieu) {
        this.validateTrangThaiPhieu(
            phieu.trang_thai
        );

        const trangThai = Number(
            phieu.trang_thai
        );

        if (
            [
                -10,
                10,
                30,
                40,
                50,
                60
            ].includes(
                trangThai
            )
        ) {
            throw new ApiError(
                400,
                "Phiếu ở trạng thái hiện tại không được phép thay đổi miễn giảm."
            );
        }
    }

    async getTongHop(query) {
        return await repository
            .getTongHop(
                query
            );
    }

    async getChiTiet(id) {
        const mienGiamId = this.parseId(
            id
        );

        const data = await repository
            .getChiTiet(
                mienGiamId
            );

        if (!data) {
            throw new ApiError(
                404,
                "Miễn giảm của phiếu không tồn tại."
            );
        }

        return data;
    }

    async getKhaDung(query) {
        const phieuLayVeId = Number(
            query.phieuLayVeId
        );

        if (
            !Number.isInteger(phieuLayVeId) ||
            phieuLayVeId <= 0
        ) {
            throw new ApiError(
                400,
                "Phiếu lấy vé không hợp lệ."
            );
        }

        const phieu = await repository
            .getPhieuById(
                phieuLayVeId
            );

        if (!phieu) {
            throw new ApiError(
                404,
                "Phiếu lấy vé ăn không tồn tại."
            );
        }

        this.validatePhieuChoPhepSua(
            phieu
        );

        if (!phieu.nhan_vien_id) {
            return [];
        }

        const thongTinTaiKhoan = await repository
            .getTaiKhoanNhanVien(
                phieu.nhan_vien_id
            );

        if (!thongTinTaiKhoan) {
            return [];
        }

        const taiKhoanId =
            thongTinTaiKhoan.tai_khoan_id
                ? Number(
                    thongTinTaiKhoan.tai_khoan_id
                )
                : null;

        const chucVuId =
            thongTinTaiKhoan.chuc_vu_id
                ? Number(
                    thongTinTaiKhoan.chuc_vu_id
                )
                : null;

        const vaiTroIds =
            taiKhoanId
                ? await repository
                    .getVaiTroTaiKhoan(
                        taiKhoanId
                    )
                : [];

        const danhSach = await repository
            .getMienGiamKhaDung({
                taiKhoanId,
                chucVuId,
                vaiTroIds
            });

        const soTienHienTai = Number(
            phieu.thanh_tien ??
            phieu.tien_goc ??
            0
        );

        return danhSach.map(
            item => {
                const soTienGiamDuKien =
                    this.tinhSoTienGiam(
                        soTienHienTai,
                        item.loaiMienGiam,
                        item.giaTri
                    );

                return {
                    ...item,
                    soTienGiamDuKien,
                    soTienSauGiamDuKien:
                        Math.max(
                            soTienHienTai -
                            soTienGiamDuKien,
                            0
                        )
                };
            }
        );
    }

    tinhSoTienGiam(
        soTienTruocGiam,
        loaiMienGiam,
        giaTri
    ) {
        const soTien = Number(
            soTienTruocGiam
        );

        const loai = Number(
            loaiMienGiam
        );

        const giaTriMienGiam = Number(
            giaTri
        );

        if (
            !Number.isFinite(soTien) ||
            soTien < 0
        ) {
            throw new ApiError(
                400,
                "Số tiền trước giảm không hợp lệ."
            );
        }

        if (
            !Number.isFinite(giaTriMienGiam) ||
            giaTriMienGiam <= 0
        ) {
            throw new ApiError(
                400,
                "Giá trị miễn giảm không hợp lệ."
            );
        }

        let soTienGiam;

        if (
            loai ===
            10
        ) {
            if (
                giaTriMienGiam >
                100
            ) {
                throw new ApiError(
                    400,
                    "Giá trị miễn giảm phần trăm không được vượt quá 100%."
                );
            }

            soTienGiam =
                soTien *
                giaTriMienGiam /
                100;
        }
        else if (
            loai === 20
        ) {
            soTienGiam =
                giaTriMienGiam;
        }
        else {
            throw new ApiError(
                400,
                "Loại miễn giảm không hợp lệ."
            );
        }

        return Math.min(
            soTienGiam,
            soTien
        );
    }

    async tinhLaiToanBo(
        phieuLayVeId,
        db
    ) {
        const phieu = await repository
            .getPhieuById(
                phieuLayVeId,
                db
            );

        if (!phieu) {
            throw new ApiError(
                404,
                "Phiếu lấy vé ăn không tồn tại."
            );
        }

        const danhSach = await repository
            .getDanhSachTheoPhieu(
                phieuLayVeId,
                db
            );

        let soTienHienTai = Number(
            phieu.tien_goc
        );

        let tongMienGiam = 0;

        for (
            const item
            of danhSach
        ) {
            const soTienTruocGiam =
                soTienHienTai;

            const soTienGiam =
                this.tinhSoTienGiam(
                    soTienTruocGiam,
                    item.loai_mien_giam,
                    item.gia_tri
                );

            const soTienSauGiam =
                Math.max(
                    soTienTruocGiam -
                    soTienGiam,
                    0
                );

            await repository
                .updateSoTienMienGiam(
                    item.id,
                    {
                        soTienTruocGiam,
                        soTienGiam,
                        soTienSauGiam
                    },
                    db
                );

            tongMienGiam +=
                soTienGiam;

            soTienHienTai =
                soTienSauGiam;
        }

        await repository
            .updateTongTienPhieu(
                phieuLayVeId,
                tongMienGiam,
                soTienHienTai,
                db
            );
    }

    async apDung(
        data,
        nguoiApId
    ) {
        const taiKhoanId = this.parseTaiKhoanId(
            nguoiApId
        );

        const phieuLayVeId = Number(
            data.phieuLayVeId
        );

        const voucherId = Number(
            data.voucherId
        );

        const chinhSachId =
            data.chinhSachId !== undefined &&
            data.chinhSachId !== null
                ? Number(
                    data.chinhSachId
                )
                : null;

        const client = await pool.connect();

        try {
            await client.query(
                "BEGIN"
            );

            const phieu = await repository
                .getPhieuById(
                    phieuLayVeId,
                    client
                );

            if (!phieu) {
                throw new ApiError(
                    404,
                    "Phiếu lấy vé ăn không tồn tại."
                );
            }

            this.validatePhieuChoPhepSua(
                phieu
            );

            const voucher = await repository
                .getVoucherById(
                    voucherId,
                    client
                );

            if (!voucher) {
                throw new ApiError(
                    404,
                    "Voucher không tồn tại."
                );
            }

            const loaiMienGiam = Number(
                voucher.loai_mien_giam
            );

            const giaTri = Number(
                voucher.gia_tri
            );

            this.validateLoaiMienGiam(
                loaiMienGiam
            );

            if (
                !Number.isFinite(giaTri) ||
                giaTri <= 0
            ) {
                throw new ApiError(
                    400,
                    "Giá trị voucher không hợp lệ."
                );
            }

            if (
                loaiMienGiam === 10 &&
                giaTri > 100
            ) {
                throw new ApiError(
                    400,
                    "Voucher phần trăm không được vượt quá 100%."
                );
            }

            if (!voucher.active) {
                throw new ApiError(
                    400,
                    "Voucher không còn hoạt động."
                );
            }

            const now = new Date();

            if (
                voucher.thoi_gian_bat_dau &&
                now <
                    new Date(
                        voucher.thoi_gian_bat_dau
                    )
            ) {
                throw new ApiError(
                    400,
                    "Voucher chưa đến thời gian áp dụng."
                );
            }

            if (
                voucher.thoi_gian_ket_thuc &&
                now >
                    new Date(
                        voucher.thoi_gian_ket_thuc
                    )
            ) {
                throw new ApiError(
                    400,
                    "Voucher đã hết thời gian áp dụng."
                );
            }

            if (
                Number(voucher.so_luong) >
                    0 &&
                Number(voucher.da_su_dung) >=
                Number(voucher.so_luong)
            ) {
                throw new ApiError(
                    400,
                    "Voucher đã hết số lượng sử dụng."
                );
            }

            if (chinhSachId) {
                const chinhSach = await repository
                    .getChinhSachById(
                        chinhSachId,
                        client
                    );

                if (
                    !chinhSach ||
                    !chinhSach.active
                ) {
                    throw new ApiError(
                        400,
                        "Chính sách không hợp lệ."
                    );
                }

                const thuocChinhSach = await repository
                    .existsChinhSachVoucher(
                        chinhSachId,
                        voucherId,
                        client
                    );

                if (!thuocChinhSach) {
                    throw new ApiError(
                        400,
                        "Voucher không thuộc chính sách đã chọn."
                    );
                }
            }

            const daApDung = await repository
                .existsVoucherTrongPhieu(
                    phieuLayVeId,
                    voucherId,
                    client
                );

            if (daApDung) {
                throw new ApiError(
                    409,
                    "Voucher đã được áp dụng cho phiếu."
                );
            }

            const thuTu = await repository
                .getThuTuTiepTheo(
                    phieuLayVeId,
                    client
                );

            const id = await repository
                .create(
                    {
                        phieuLayVeId,
                        chinhSachId,
                        voucherId,
                        maMienGiam: voucher.ma_voucher,
                        tenMienGiam: voucher.ten_voucher,
                        loaiMienGiam: loaiMienGiam,
                        giaTri: giaTri,
                        soTienTruocGiam: 0,
                        soTienGiam: 0,
                        soTienSauGiam: 0,
                        thuTuApDung: thuTu,
                        lyDoMienGiam: null,
                        nguoiTaoMienGiamId: null,
                        nguoiApMienGiamId: taiKhoanId
                    },
                    client
                );

            await this.tinhLaiToanBo(
                phieuLayVeId,
                client
            );

            await client.query(
                "COMMIT"
            );

            return await repository
                .getChiTiet(
                    id
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

    async create(
        data,
        nguoiTaoId
    ) {
        const taiKhoanId = this.parseTaiKhoanId(
            nguoiTaoId
        );

        this.validateLoaiMienGiam(
            data.loaiMienGiam
        );

        if (
            Number(data.loaiMienGiam) === 10 &&
            Number(data.giaTri) > 100
        ) {
            throw new ApiError(
                400,
                "Miễn giảm phần trăm không được vượt quá 100%."
            );
        }

        const phieuLayVeId = Number(
            data.phieuLayVeId
        );

        const client = await pool.connect();

        try {
            await client.query(
                "BEGIN"
            );

            const phieu = await repository
                .getPhieuById(
                    phieuLayVeId,
                    client
                );

            if (!phieu) {
                throw new ApiError(
                    404,
                    "Phiếu lấy vé ăn không tồn tại."
                );
            }

            this.validatePhieuChoPhepSua(
                phieu
            );

            const mienGiamThuCongHienTai = await repository
                .getMienGiamThuCongTheoPhieu(
                    phieuLayVeId,
                    client
                );

            if (mienGiamThuCongHienTai) {
                throw new ApiError(
                    409,
                    "Phiếu đã có miễn giảm thủ công. Vui lòng cập nhật miễn giảm hiện tại."
                );
            }

            const thuTu = await repository
                .getThuTuTiepTheo(
                    phieuLayVeId,
                    client
                );

            const id = await repository
                .create(
                    {
                        phieuLayVeId,
                        chinhSachId: null,
                        voucherId: null,
                        maMienGiam:
                            data.maMienGiam?.trim() ||
                            null,
                        tenMienGiam:
                            data.tenMienGiam
                                .trim(),
                        loaiMienGiam:
                            Number(
                                data.loaiMienGiam
                            ),
                        giaTri:
                            Number(
                                data.giaTri
                            ),
                        soTienTruocGiam: 0,
                        soTienGiam: 0,
                        soTienSauGiam: 0,
                        thuTuApDung: thuTu,
                        lyDoMienGiam:
                            data.lyDoMienGiam
                                .trim(),
                        nguoiTaoMienGiamId:
                            taiKhoanId,
                        nguoiApMienGiamId:
                            taiKhoanId
                    },
                    client
                );

            await this.tinhLaiToanBo(
                phieuLayVeId,
                client
            );

            await client.query(
                "COMMIT"
            );

            return await repository
                .getChiTiet(
                    id
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

    async update(
        id,
        data
    ) {
        const mienGiamId = this.parseId(
            id
        );

        const hienTai = await this.getChiTiet(
            mienGiamId
        );

        if (
            hienTai.chinhSachId ||
            hienTai.voucherId
        ) {
            throw new ApiError(
                400,
                "Miễn giảm chọn từ danh mục không được phép chỉnh sửa."
            );
        }

        const client = await pool.connect();

        try {
            await client.query(
                "BEGIN"
            );

            const phieu = await repository
                .getPhieuById(
                    hienTai.phieuLayVeId,
                    client
                );

            this.validatePhieuChoPhepSua(
                phieu
            );

            const loaiMienGiam =
                data.loaiMienGiam !== undefined
                    ? Number(
                        data.loaiMienGiam
                    )
                    : Number(
                        hienTai.loaiMienGiam
                    );

            this.validateLoaiMienGiam(
                loaiMienGiam
            );

            const giaTri =
                data.giaTri !== undefined
                    ? Number(
                        data.giaTri
                    )
                    : Number(
                        hienTai.giaTri
                    );

            if (
                loaiMienGiam === 10 &&
                giaTri > 100
            ) {
                throw new ApiError(
                    400,
                    "Miễn giảm phần trăm không được vượt quá 100%."
                );
            }

            await repository
                .updateThongTin(
                    mienGiamId,
                    {
                        maMienGiam:
                            data.maMienGiam !== undefined
                                ? (
                                    data.maMienGiam?.trim() ||
                                    null
                                )
                                : hienTai.maMienGiam,

                        tenMienGiam:
                            data.tenMienGiam !== undefined
                                ? data.tenMienGiam
                                    .trim()
                                : hienTai.tenMienGiam,

                        loaiMienGiam,

                        giaTri,

                        lyDoMienGiam:
                            data.lyDoMienGiam !== undefined
                                ? data.lyDoMienGiam
                                    .trim()
                                : hienTai.lyDoMienGiam
                    },
                    client
                );

            await this.tinhLaiToanBo(
                hienTai.phieuLayVeId,
                client
            );

            await client.query(
                "COMMIT"
            );

            return await repository
                .getChiTiet(
                    mienGiamId
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

    async delete(id) {
        const mienGiamId = this.parseId(
            id
        );

        const hienTai = await this.getChiTiet(
            mienGiamId
        );

        const client = await pool.connect();

        try {
            await client.query(
                "BEGIN"
            );

            const phieu = await repository
                .getPhieuById(
                    hienTai.phieuLayVeId,
                    client
                );

            this.validatePhieuChoPhepSua(
                phieu
            );

            const ketQua = await repository
                .delete(
                    mienGiamId,
                    client
                );

            if (!ketQua) {
                throw new ApiError(
                    404,
                    "Miễn giảm của phiếu không tồn tại."
                );
            }

            await this.tinhLaiToanBo(
                hienTai.phieuLayVeId,
                client
            );

            await client.query(
                "COMMIT"
            );

            return {
                id: mienGiamId
            };
        } catch (error) {
            await client.query(
                "ROLLBACK"
            );

            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new PhieuLayVeMienGiamService();