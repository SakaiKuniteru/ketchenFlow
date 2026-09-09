const {
    trangThaiDonHang:
        dsTrangThaiDonHang
} = require(
    "../../../../constants/enums"
);

const ApiError =
    require(
        "../../../../utils/api-error"
    );

const cauHinhService =
    require(
        "../../../cau-hinh/cau-hinh.service"
    );

const khungGioNhanHangRepository =
    require(
        "./khung-gio-nhan-hang.repository"
    );


class KhungGioNhanHangService {

    parseId(
        id
    ) {

        const khungGioNhanHangId =
            Number(id);

        if (
            !Number.isInteger(
                khungGioNhanHangId
            ) ||
            khungGioNhanHangId <= 0
        ) {

            throw new ApiError(
                400,
                "ID khung giờ nhận hàng không hợp lệ."
            );

        }

        return khungGioNhanHangId;

    }


    parseCoSoId(
        coSoId
    ) {

        const giaTri =
            Number(coSoId);

        if (
            !Number.isInteger(
                giaTri
            ) ||
            giaTri <= 0
        ) {

            throw new ApiError(
                400,
                "Cơ sở không hợp lệ."
            );

        }

        return giaTri;

    }


    parseNgayNhan(
        ngayNhan
    ) {

        const giaTri =
            String(
                ngayNhan ||
                ""
            ).trim();

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                giaTri
            )
        ) {

            throw new ApiError(
                400,
                "Ngày nhận phải có định dạng YYYY-MM-DD."
            );

        }

        const ngay =
            new Date(
                `${giaTri}T00:00:00`
            );

        if (
            Number.isNaN(
                ngay.getTime()
            )
        ) {

            throw new ApiError(
                400,
                "Ngày nhận không hợp lệ."
            );

        }

        return giaTri;

    }


    chuanHoaThoiGian(
        value
    ) {

        const giaTri =
            String(
                value
            ).trim();

        return giaTri.length === 5
            ? `${giaTri}:00`
            : giaTri;

    }


    getGiaTriTrangThai(
        tenTrangThai
    ) {

        const trangThai =
            dsTrangThaiDonHang.find(
                item =>
                    item.name ===
                    tenTrangThai
            );

        if (!trangThai) {

            throw new Error(
                `Không tìm thấy enum trạng thái "${tenTrangThai}".`
            );

        }

        return Number(
            trangThai.value
        );

    }


    getDanhSachTrangThaiLoaiTru() {

        return [
            this.getGiaTriTrangThai(
                "Đã từ chối"
            ),

            this.getGiaTriTrangThai(
                "Đã huỷ"
            )
        ];

    }


    async getTongHop(
        query
    ) {

        const [
            danhSach,
            soPhutDatTruoc
        ] =
            await Promise.all([

                khungGioNhanHangRepository
                    .getTongHop(
                        query
                    ),

                cauHinhService
                    .getSoPhutDatHangTruoc()

            ]);

        return danhSach.map(
            item => ({
                ...item,

                soPhutDatTruoc
            })
        );

    }


    async getKhungGioKhaDung(
        query
    ) {

        const coSoId =
            this.parseCoSoId(
                query.coSoId
            );

        const ngayNhan =
            this.parseNgayNhan(
                query.ngayNhan
            );

        const coSoTonTai =
            await khungGioNhanHangRepository
                .existsCoSo(
                    coSoId
                );

        if (!coSoTonTai) {

            throw new ApiError(
                400,
                "Cơ sở không tồn tại hoặc đã ngừng hoạt động."
            );

        }

        const soPhutDatTruoc =
            await cauHinhService
                .getSoPhutDatHangTruoc();

        const danhSach =
            await khungGioNhanHangRepository
                .getKhungGioKhaDung(
                    coSoId,
                    ngayNhan,
                    soPhutDatTruoc,
                    this.getDanhSachTrangThaiLoaiTru()
                );

        return {
            coSoId,

            ngayNhan,

            soPhutDatTruoc,

            items:
                danhSach.map(
                    item => ({
                        ...item,

                        soPhutDatTruoc
                    })
                )
        };

    }


    async getChiTiet(
        id
    ) {

        const khungGioNhanHangId =
            this.parseId(id);

        const khungGio =
            await khungGioNhanHangRepository
                .getChiTiet(
                    khungGioNhanHangId
                );

        if (!khungGio) {

            throw new ApiError(
                404,
                "Khung giờ nhận hàng không tồn tại."
            );

        }

        const soPhutDatTruoc =
            await cauHinhService
                .getSoPhutDatHangTruoc();

        return {
            ...khungGio,

            soPhutDatTruoc
        };

    }


    async validateTrungDuLieu(
        data,
        excludeId = null
    ) {

        const trungMa =
            await khungGioNhanHangRepository
                .existsMaKhungGio(
                    data.coSoId,
                    data.maKhungGio,
                    excludeId
                );

        if (trungMa) {

            throw new ApiError(
                409,
                "Mã khung giờ đã tồn tại trong cơ sở."
            );

        }

        const trungTen =
            await khungGioNhanHangRepository
                .existsTenKhungGio(
                    data.coSoId,
                    data.tenKhungGio,
                    excludeId
                );

        if (trungTen) {

            throw new ApiError(
                409,
                "Tên khung giờ đã tồn tại trong cơ sở."
            );

        }

    }


    async validateDuLieu(
        data,
        excludeId = null
    ) {

        if (
            data.gioBatDau >=
            data.gioKetThuc
        ) {

            throw new ApiError(
                400,
                "Giờ bắt đầu phải nhỏ hơn giờ kết thúc."
            );

        }

        const coSoTonTai =
            await khungGioNhanHangRepository
                .existsCoSo(
                    data.coSoId
                );

        if (!coSoTonTai) {

            throw new ApiError(
                400,
                "Cơ sở không tồn tại hoặc đã ngừng hoạt động."
            );

        }

        await this.validateTrungDuLieu(
            data,
            excludeId
        );

        if (
            data.active === true
        ) {

            const giaoNhau =
                await khungGioNhanHangRepository
                    .existsKhungGioGiaoNhau(
                        data.coSoId,
                        data.gioBatDau,
                        data.gioKetThuc,
                        excludeId
                    );

            if (giaoNhau) {

                throw new ApiError(
                    409,
                    "Khung giờ bị trùng hoặc giao với một khung giờ đang hoạt động."
                );

            }

        }

    }


    async create(
        data
    ) {

        const duLieuTao = {

            maKhungGio:
                data.maKhungGio.trim(),

            tenKhungGio:
                data.tenKhungGio.trim(),

            coSoId:
                Number(
                    data.coSoId
                ),

            gioBatDau:
                this.chuanHoaThoiGian(
                    data.gioBatDau
                ),

            gioKetThuc:
                this.chuanHoaThoiGian(
                    data.gioKetThuc
                ),

            soDonToiDa:
                data.soDonToiDa !== undefined
                    ? data.soDonToiDa
                    : null,

            active:
                data.active !== undefined
                    ? data.active
                    : true

        };

        await this.validateDuLieu(
            duLieuTao
        );

        return await khungGioNhanHangRepository
            .create(
                duLieuTao
            );

    }


    async update(
        id,
        data
    ) {

        const khungGioNhanHangId =
            this.parseId(id);

        const khungGio =
            await khungGioNhanHangRepository
                .getChiTiet(
                    khungGioNhanHangId
                );

        if (!khungGio) {

            throw new ApiError(
                404,
                "Khung giờ nhận hàng không tồn tại."
            );

        }

        const duLieuCapNhat = {

            maKhungGio:
                data.maKhungGio !== undefined
                    ? data.maKhungGio.trim()
                    : khungGio.maKhungGio,

            tenKhungGio:
                data.tenKhungGio !== undefined
                    ? data.tenKhungGio.trim()
                    : khungGio.tenKhungGio,

            coSoId:
                data.coSoId !== undefined
                    ? Number(
                        data.coSoId
                    )
                    : Number(
                        khungGio.coSoId
                    ),

            gioBatDau:
                data.gioBatDau !== undefined
                    ? this.chuanHoaThoiGian(
                        data.gioBatDau
                    )
                    : khungGio.gioBatDau,

            gioKetThuc:
                data.gioKetThuc !== undefined
                    ? this.chuanHoaThoiGian(
                        data.gioKetThuc
                    )
                    : khungGio.gioKetThuc,

            soDonToiDa:
                data.soDonToiDa !== undefined
                    ? data.soDonToiDa
                    : khungGio.soDonToiDa,

            active:
                data.active !== undefined
                    ? data.active
                    : khungGio.active

        };

        await this.validateDuLieu(
            duLieuCapNhat,
            khungGioNhanHangId
        );

        const ketQua =
            await khungGioNhanHangRepository
                .update(
                    khungGioNhanHangId,
                    duLieuCapNhat
                );

        if (!ketQua) {

            throw new ApiError(
                404,
                "Khung giờ nhận hàng không tồn tại."
            );

        }

        return ketQua;

    }


    async kiemTraKhungGioCoTheDat(
        data,
        client
    ) {

        const khungGioNhanHangId =
            this.parseId(
                data.khungGioNhanId
            );

        const coSoId =
            this.parseCoSoId(
                data.coSoId
            );

        const ngayNhan =
            this.parseNgayNhan(
                data.ngayNhan
            );

        const soPhutDatTruoc =
            await cauHinhService
                .getSoPhutDatHangTruoc();

        const khungGio =
            await khungGioNhanHangRepository
                .getKhungGioDeDat(
                    khungGioNhanHangId,
                    coSoId,
                    ngayNhan,
                    soPhutDatTruoc,
                    this.getDanhSachTrangThaiLoaiTru(),
                    client
                );

        if (!khungGio) {

            throw new ApiError(
                400,
                "Khung giờ nhận hàng không tồn tại, đã ngừng hoạt động hoặc không thuộc cơ sở."
            );

        }

        if (
            khungGio.conThoiGianDat !==
            true
        ) {

            throw new ApiError(
                409,
                `Đã quá thời hạn đặt trước ${soPhutDatTruoc} phút của khung giờ.`
            );

        }

        if (
            khungGio.soDonToiDa !== null &&
            khungGio.soDonDaDat >=
                khungGio.soDonToiDa
        ) {

            throw new ApiError(
                409,
                "Khung giờ nhận hàng đã đủ số lượng đơn tối đa."
            );

        }

        return {
            ...khungGio,

            soPhutDatTruoc
        };

    }

}


module.exports =
    new KhungGioNhanHangService();