const crypto = require("crypto");
const pool = require("../../../../config/database");

const {
    phuongThucThanhToan: dsPhuongThucThanhToan,
    loaiGiaoDich: dsLoaiGiaoDich,
    trangThaiThanhToan: dsTrangThaiThanhToan,
    trangThaiPhieuThu: dsTrangThaiPhieuThu,
    trangThaiVe: dsTrangThaiVe
} = require("../../../../constants/enums");

const ApiError = require("../../../../utils/api-error");
const repository = require("./thanh-toan-ve-an.repository");
const phieuLayVeAnService = require("../phieu-lay-ve-an/phieu-lay-ve-an.service");
const qrPaymentGateway = require("./qr-payment.gateway");
const inBaoCaoService = require("../../../../services/in-bao-cao/in-bao-cao.service");

class ThanhToanVeAnService {
    parseId(id) {
        const value = Number(id);

        if (
            !Number.isInteger(value) ||
            value <= 0
        ) {
            throw new ApiError(
                400,
                "ID giao dịch thanh toán không hợp lệ."
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

    validateEnum(
        danhSach,
        value,
        message
    ) {
        const hopLe = danhSach.some(
            item =>
                Number(item.value) ===
                Number(value)
        );

        if (!hopLe) {
            throw new ApiError(
                400,
                message
            );
        }
    }

    async getTongHop(query) {
        return await repository
            .getTongHop(
                query
            );
    }

    async getDanhSachPhieu(phieuLayVeId) {
        const id = this.parseId(
            phieuLayVeId
        );

        return await repository
            .getDanhSachPhieu(
                id
            );
    }

    async getChiTiet(id) {
        const thanhToanId = this.parseId(
            id
        );

        const data = await repository
            .getChiTiet(
                thanhToanId
            );

        if (!data) {
            throw new ApiError(
                404,
                "Giao dịch thanh toán không tồn tại."
            );
        }

        return data;
    }

    async getDuLieuInPhieuHoan(
        id,
        nguoiInId
    ) {
        const thanhToanId = this.parseId(
            id
        );

        const taiKhoanInId = this.parseTaiKhoanId(
            nguoiInId
        );

        const giaoDich = await this.getChiTiet(
            thanhToanId
        );

        const loaiHoanTien = this.getEnumValue(
            dsLoaiGiaoDich,
            "Hoàn tiền"
        );

        const thanhCong = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Thành công"
        );

        if (
            Number(giaoDich.loaiGiaoDich) !==
                loaiHoanTien ||
            Number(giaoDich.trangThai) !==
                thanhCong
        ) {
            throw new ApiError(
                400,
                "Giao dịch không phải phiếu hoàn thành công."
            );
        }

        const phieu = await phieuLayVeAnService
            .getChiTiet(
                giaoDich.phieuLayVeId
            );

        const data = inBaoCaoService
            .normalizeReportData({
                ...phieu,
                phieuHoanId: giaoDich.id,
                maPhieuHoan: giaoDich.maGiaoDich,
                thanhToanGocId: giaoDich.thanhToanGocId,
                phieuMoiId: giaoDich.phieuMoiId,
                soLuongHoan: giaoDich.soLuong,
                soTienHoan: giaoDich.soTien,
                phuongThucHoan: giaoDich.phuongThuc,
                lyDoHoan: giaoDich.noiDungLoi,
                nguoiHoanId: giaoDich.nguoiXacNhanId,
                tenNguoiHoan:
                    giaoDich.tenNguoiXacNhan ||
                    giaoDich.nguoiXacNhanTenDangNhap ||
                    "",
                ngay:
                    inBaoCaoService
                        .normalizeDate(
                            phieu.ngay
                        ),
                ngaySinhNguoiLayVe:
                    phieu.ngaySinhNguoiLayVe
                        ? inBaoCaoService
                            .normalizeDate(
                                phieu.ngaySinhNguoiLayVe
                            )
                        : null,
                thoiGianBatDau:
                    inBaoCaoService
                        .normalizeTime(
                            phieu.thoiGianBatDau
                        ),
                thoiGianKetThuc:
                    inBaoCaoService
                        .normalizeTime(
                            phieu.thoiGianKetThuc
                        ),
                thoiGianHoan:
                    inBaoCaoService
                        .normalizeDateTime(
                            giaoDich.thoiGianThanhToan ||
                            giaoDich.createdAt
                        ),
                nguoiLayVe:
                    phieu.tenNhanVien ||
                    phieu.hoTenNguoiLayVe ||
                    ""
            });

        return await inBaoCaoService
            .taoBaoCao({
                maBaoCao: "phieu_hoan_ve_an",
                id: giaoDich.id,
                soPhieu: giaoDich.maGiaoDich,
                data,
                nguoiInId: taiKhoanInId
            });
    }

    async getPhieuHopLe(
        id,
        db = pool
    ) {
        const phieu = await repository
            .getPhieuById(
                id,
                db
            );

        if (!phieu) {
            throw new ApiError(
                404,
                "Phiếu lấy vé ăn không tồn tại."
            );
        }

        return phieu;
    }

    taoMaGiaoDich() {
        const now = new Date();

        const time = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(
                2,
                "0"
            ),
            String(now.getDate()).padStart(
                2,
                "0"
            ),
            String(now.getHours()).padStart(
                2,
                "0"
            ),
            String(now.getMinutes()).padStart(
                2,
                "0"
            ),
            String(now.getSeconds()).padStart(
                2,
                "0"
            )
        ].join("");

        const random = crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase();

        return `TT${time}${random}`;
    }

    taoMaVe(
        phieuLayVeId,
        soThuTu
    ) {
        const random = crypto
            .randomBytes(4)
            .toString("hex")
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
            .randomBytes(32)
            .toString("hex");
    }

    async sinhVeSauThanhToan(
        phieu,
        db
    ) {
        const daCoVe = await repository
            .existsVeTheoPhieu(
                phieu.id,
                db
            );

        if (daCoVe) {
            return;
        }

        const trangThaiChuaSuDung = this.getEnumValue(
            dsTrangThaiVe,
            "Chưa sử dụng"
        );

        for (
            let soThuTu = 1;
            soThuTu <= Number(phieu.so_luong);
            soThuTu++
        ) {
            await repository
                .createVe(
                    {
                        phieuLayVeId: phieu.id,
                        thucDonNgayId: phieu.thuc_don_ngay_id,
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
        const trangThaiThanhCong = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Thành công"
        );

        const daThanhToan = await repository
            .existsThanhToanThanhCong(
                thanhToan.phieuLayVeId,
                db
            );

        if (
            daThanhToan &&
            Number(thanhToan.trangThai) !==
                trangThaiThanhCong
        ) {
            throw new ApiError(
                409,
                "Phiếu đã có giao dịch thanh toán thành công."
            );
        }

        const phieu = await this.getPhieuHopLe(
            thanhToan.phieuLayVeId,
            db
        );

        const phuongThucQr = this.getEnumValue(
            dsPhuongThucThanhToan,
            "QR Code"
        );

        if (
            Number(thanhToan.phuongThuc) !==
            phuongThucQr
        ) {
            await repository
                .syncThanhToanChoXuLy(
                    thanhToan.id,
                    {
                        soTien:
                            Number(
                                phieu.thanh_tien
                            ),
                        soLuong:
                            Number(
                                phieu.so_luong
                            )
                    },
                    db
                );

            thanhToan.soTien =
                Number(
                    phieu.thanh_tien
                );

            thanhToan.soLuong =
                Number(
                    phieu.so_luong
                );
        }

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
        const taiKhoanId = this.parseTaiKhoanId(
            nguoiKhoiTaoId
        );

        const phuongThuc = Number(
            data.phuongThuc
        );

        this.validateEnum(
            dsPhuongThucThanhToan,
            phuongThuc,
            "Phương thức thanh toán không hợp lệ."
        );

        const phuongThucQr = this.getEnumValue(
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

        const phieuLayVeId = Number(
            data.phieuLayVeId
        );

        const phieu = await this.getPhieuHopLe(
            phieuLayVeId
        );

        const daThanhToan = await repository
            .existsThanhToanThanhCong(
                phieuLayVeId
            );

        if (daThanhToan) {
            throw new ApiError(
                409,
                "Phiếu đã được thanh toán."
            );
        }

        const loaiThanhToan = this.getEnumValue(
            dsLoaiGiaoDich,
            "Thanh toán"
        );

        const choXuLy = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Chờ xử lý"
        );

        const soTien = Number( phieu.thanh_tien );

        const id = await repository
            .create(
                {
                    phieuLayVeId,
                    loaiGiaoDich:
                        loaiThanhToan,
                    phuongThuc,
                    soTien,
                    soLuong:
                        Number(
                            phieu.so_luong
                        ),
                    thanhToanGocId:
                        null,
                    phieuMoiId:
                        null,
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
        const taiKhoanId = this.parseTaiKhoanId(
            nguoiKhoiTaoId
        );

        const phieuLayVeId = Number(
            data.phieuLayVeId
        );

        const phieu = await this.getPhieuHopLe(
            phieuLayVeId
        );

        const daThanhToan = await repository
            .existsThanhToanThanhCong(
                phieuLayVeId
            );

        if (daThanhToan) {
            throw new ApiError(
                409,
                "Phiếu đã được thanh toán."
            );
        }

        const phuongThucQr = this.getEnumValue(
            dsPhuongThucThanhToan,
            "QR Code"
        );

        const loaiThanhToan = this.getEnumValue(
            dsLoaiGiaoDich,
            "Thanh toán"
        );

        const dangXuLy = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Đang xử lý"
        );

        const maGiaoDich = this.taoMaGiaoDich();

        const soTien = Number(
            phieu.thanh_tien
        );

        const qrData = await qrPaymentGateway
            .create({
                maGiaoDich,
                soTien,
                soPhieu:
                    phieu.so_phieu
            });

        const id = await repository
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
                    soLuong:
                        Number(
                            phieu.so_luong
                        ),
                    thanhToanGocId:
                        null,
                    phieuMoiId:
                        null,
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

        const trangThaiTaoQr = this.getEnumValue(
            dsTrangThaiPhieuThu,
            "Tạo QR"
        );

        await repository
            .updateTrangThaiPhieu(
                phieuLayVeId,
                trangThaiTaoQr
            );

        const thanhToan = await repository
            .getChiTiet(
                id
            );

        return {
            ...thanhToan,
            qrData
        };
    }

    async getQr(id) {
        const thanhToanId = this.parseId(
            id
        );

        const thanhToan = await this.getChiTiet(
            thanhToanId
        );

        const phuongThucQr = this.getEnumValue(
            dsPhuongThucThanhToan,
            "QR Code"
        );

        if (
            Number(thanhToan.phuongThuc) !==
            phuongThucQr
        ) {
            throw new ApiError(
                400,
                "Giao dịch không phải QR Code."
            );
        }

        const daHuy = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Đã huỷ"
        );

        if (
            Number(thanhToan.trangThai) ===
            daHuy
        ) {
            throw new ApiError(
                400,
                "QR Code đã bị hủy."
            );
        }

        const qrData = await qrPaymentGateway
            .create({
                maGiaoDich:
                    thanhToan.maGiaoDich,
                soTien:
                    thanhToan.soTien,
                soPhieu:
                    thanhToan.soPhieu
            });

        return {
            ...thanhToan,
            qrData
        };
    }

    async huyQr(
        id,
        data,
        nguoiXacNhanId
    ) {
        const thanhToanId = this.parseId(
            id
        );

        const taiKhoanId = this.parseTaiKhoanId(
            nguoiXacNhanId
        );

        const thanhToan = await this.getChiTiet(
            thanhToanId
        );

        const phuongThucQr = this.getEnumValue(
            dsPhuongThucThanhToan,
            "QR Code"
        );

        if (
            Number(thanhToan.phuongThuc) !==
            phuongThucQr
        ) {
            throw new ApiError(
                400,
                "Giao dịch không phải thanh toán QR."
            );
        }

        const thanhCong = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Thành công"
        );

        if (
            Number(thanhToan.trangThai) ===
            thanhCong
        ) {
            throw new ApiError(
                400,
                "Giao dịch đã thành công nên không thể hủy QR."
            );
        }

        const daHuy = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Đã huỷ"
        );

        const client = await pool.connect();

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
        } catch (error) {
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
        const thanhToanId = this.parseId(
            id
        );

        const taiKhoanId = this.parseTaiKhoanId(
            nguoiXacNhanId
        );

        const thanhToan = await this.getChiTiet(
            thanhToanId
        );

        const choXuLy = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Chờ xử lý"
        );

        const dangXuLy = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Đang xử lý"
        );

        if (
            ![
                choXuLy,
                dangXuLy
            ].includes(
                Number(
                    thanhToan.trangThai
                )
            )
        ) {
            throw new ApiError(
                400,
                "Giao dịch không còn ở trạng thái có thể duyệt."
            );
        }

        const client = await pool.connect();

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
        } catch (error) {
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
        const taiKhoanId = this.parseTaiKhoanId(
            nguoiKhoiTaoId
        );

        const thanhToanId = this.parseId(
            data.thanhToanId
        );

        const thanhToan = await this.getChiTiet(
            thanhToanId
        );

        const loaiThanhToan = this.getEnumValue(
            dsLoaiGiaoDich,
            "Thanh toán"
        );

        const loaiHoanTien = this.getEnumValue(
            dsLoaiGiaoDich,
            "Hoàn tiền"
        );

        const thanhCong = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Thành công"
        );

        const chuaThanhToan = this.getEnumValue(
            dsTrangThaiPhieuThu,
            "Chưa thanh toán"
        );

        if (
            Number(thanhToan.loaiGiaoDich) !==
                loaiThanhToan ||
            Number(thanhToan.trangThai) !==
                thanhCong
        ) {
            throw new ApiError(
                400,
                "Chỉ được hoàn từ phiếu thu đã thanh toán."
            );
        }

        const phieuNguon = await this.getPhieuHopLe(
            thanhToan.phieuLayVeId
        );

        const tongSoLuong = Number(
            thanhToan.soLuong ||
            phieuNguon.so_luong
        );

        const soLuongDaHoan = await repository
            .getSoLuongDaHoanTheoThanhToan(
                thanhToanId
            );

        const soLuongConLai = Math.max(
            tongSoLuong -
            soLuongDaHoan,
            0
        );

        const soLuongHoan = Number(
            data.soLuongHoan
        );

        if (
            !Number.isInteger(soLuongHoan) ||
            soLuongHoan < 1 ||
            soLuongHoan > soLuongConLai
        ) {
            throw new ApiError(
                400,
                `Chỉ còn ${soLuongConLai} vé có thể hoàn.`
            );
        }

        const phuongThuc = Number(
            data.phuongThuc
        );

        this.validateEnum(
            dsPhuongThucThanhToan,
            phuongThuc,
            "Phương thức hoàn tiền không hợp lệ."
        );

        const lyDoHoan = String(
            data.lyDoHoan ||
            ""
        ).trim();

        if (!lyDoHoan) {
            throw new ApiError(
                400,
                "Lý do hoàn là bắt buộc."
            );
        }

        const tongTienThanhToan = Number(
            thanhToan.soTien
        );

        const tongDaHoan = await repository
            .getTongDaHoanTheoThanhToan(
                thanhToanId
            );

        let soTienHoan = Number(
            (
                tongTienThanhToan /
                tongSoLuong *
                soLuongHoan
            ).toFixed(
                5
            )
        );

        /*
        * Lần hoàn cuối lấy phần còn lại chính xác,
        * tránh sai số chia tiền.
        */
        if (
            soLuongDaHoan +
            soLuongHoan ===
            tongSoLuong
        ) {
            soTienHoan =
                Number(
                    (
                        tongTienThanhToan -
                        tongDaHoan
                    ).toFixed(
                        5
                    )
                );
        }

        const client = await pool.connect();

        try {
            await client.query(
                "BEGIN"
            );

            const soPhieuMoi = await phieuLayVeAnService
                .taoSoPhieuMoi(
                    client
                );

            const phieuGocId = Number(
                phieuNguon.phieu_goc_id ||
                phieuNguon.id
            );

            const phieuMoiId = await repository
                .createPhieuSauHoan(
                    {
                        phieuNguonId:
                            phieuNguon.id,
                        soPhieu:
                            soPhieuMoi,
                        soLuong:
                            soLuongHoan,
                        trangThai:
                            chuaThanhToan,
                        nguoiTaoId:
                            taiKhoanId,
                        phieuGocId
                    },
                    client
                );

            if (!phieuMoiId) {
                throw new ApiError(
                    500,
                    "Không tạo được phiếu mới sau hoàn tiền."
                );
            }

            const hoanTienId = await repository
                .create(
                    {
                        phieuLayVeId:
                            phieuNguon.id,
                        loaiGiaoDich:
                            loaiHoanTien,
                        phuongThuc,
                        soTien:
                            soTienHoan,
                        soLuong:
                            soLuongHoan,
                        thanhToanGocId:
                            thanhToanId,
                        phieuMoiId,
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
                            lyDoHoan,
                        nguoiKhoiTaoId:
                            taiKhoanId,
                        nguoiXacNhanId:
                            taiKhoanId,
                        thoiGianThanhToan:
                            new Date()
                    },
                    client
                );

            const veDaHuy = await repository
                .huySoLuongVeTheoPhieu(
                    phieuNguon.id,
                    soLuongHoan,
                    taiKhoanId,
                    lyDoHoan,
                    client
                );

            if (
                veDaHuy.length !==
                soLuongHoan
            ) {
                throw new ApiError(
                    409,
                    "Không còn đủ vé chưa sử dụng để hoàn."
                );
            }

            /*
            * Hoàn hết:
            * KHÔNG đổi phiếu nguồn sang 60.
            *
            * Nó vẫn là dòng Đã thanh toán.
            * Phiếu hoàn đã là một dòng riêng.
            */
            if (
                soLuongDaHoan +
                soLuongHoan ===
                tongSoLuong
            ) {
                await repository
                    .giamVoucherDaSuDung(
                        phieuNguon.id,
                        client
                    );
            }

            await client.query(
                "COMMIT"
            );

            return {
                phieuHoan:
                    await repository
                        .getChiTiet(
                            hoanTienId
                        ),
                phieuMoiId
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

    async huyThanhToan(
        id,
        data,
        nguoiThucHienId
    ) {
        const thanhToanId = this.parseId(
            id
        );

        const taiKhoanId = this.parseTaiKhoanId(
            nguoiThucHienId
        );

        const client = await pool.connect();

        try {
            await client.query(
                "BEGIN"
            );

            const thanhToan = await repository
                .getChiTiet(
                    thanhToanId,
                    client
                );

            if (!thanhToan) {
                throw new ApiError(
                    404,
                    "Phiếu thu không tồn tại."
                );
            }

            const loaiThanhToan = this.getEnumValue(
                dsLoaiGiaoDich,
                "Thanh toán"
            );

            if (
                Number(thanhToan.loaiGiaoDich) !==
                loaiThanhToan
            ) {
                throw new ApiError(
                    400,
                    "Chỉ được hủy phiếu thu thanh toán."
                );
            }

            const thanhCong = this.getEnumValue(
                dsTrangThaiThanhToan,
                "Thành công"
            );

            if (
                Number(thanhToan.trangThai) !==
                thanhCong
            ) {
                throw new ApiError(
                    400,
                    "Phiếu thu không ở trạng thái đã thanh toán."
                );
            }

            const daCoHoan = await repository
                .existsHoanTheoThanhToan(
                    thanhToanId,
                    client
                );

            if (daCoHoan) {
                throw new ApiError(
                    409,
                    "Phiếu đã phát sinh hoàn tiền nên không thể hủy thanh toán."
                );
            }

            const coVeDaSuDung = await repository
                .existsVeDaSuDung(
                    thanhToan.phieuLayVeId,
                    client
                );

            if (coVeDaSuDung) {
                throw new ApiError(
                    409,
                    "Đã có vé được sử dụng nên không thể hủy thanh toán."
                );
            }

            const daHuy = this.getEnumValue(
                dsTrangThaiThanhToan,
                "Đã huỷ"
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
                            String(
                                data?.noiDung ||
                                "Hủy thanh toán."
                            ).trim(),
                        nguoiXacNhanId:
                            taiKhoanId
                    },
                    client
                );

            const chuaThanhToan = this.getEnumValue(
                dsTrangThaiPhieuThu,
                "Chưa thanh toán"
            );

            await repository
                .resetPhieuThanhToan(
                    thanhToan.phieuLayVeId,
                    chuaThanhToan,
                    client
                );

            /*
            * Thanh toán đã bị đảo ngược.
            */
            await repository
                .giamVoucherDaSuDung(
                    thanhToan.phieuLayVeId,
                    client
                );

            await repository
                .deleteVeChuaSuDungTheoPhieu(
                    thanhToan.phieuLayVeId,
                    client
                );

            await client.query(
                "COMMIT"
            );

            return await repository
                .getChiTiet(
                    thanhToanId
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

    async callback(data) {
        const thanhToan = await repository
            .getByMaGiaoDich(
                data.maGiaoDich
            );

        if (!thanhToan) {
            throw new ApiError(
                404,
                "Không tìm thấy giao dịch thanh toán."
            );
        }

        const thanhCong = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Thành công"
        );

        const thatBai = this.getEnumValue(
            dsTrangThaiThanhToan,
            "Thất bại"
        );

        const trangThaiCallback = Number(
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

        const client = await pool.connect();

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

module.exports = new ThanhToanVeAnService();