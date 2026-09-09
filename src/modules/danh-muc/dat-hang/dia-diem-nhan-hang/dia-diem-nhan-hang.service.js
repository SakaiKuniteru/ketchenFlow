const {
    loaiDiaDiemNhanHang:
        dsLoaiDiaDiemNhanHang
} = require("../../../../constants/enums");

const ApiError =
    require("../../../../utils/api-error");

const diaDiemNhanHangRepository =
    require("./dia-diem-nhan-hang.repository");


class DiaDiemNhanHangService {

    parseId(
        id
    ) {

        const diaDiemNhanHangId =
            Number(id);

        if (
            !Number.isInteger(
                diaDiemNhanHangId
            ) ||
            diaDiemNhanHangId <= 0
        ) {

            throw new ApiError(
                400,
                "ID địa điểm nhận hàng không hợp lệ."
            );

        }

        return diaDiemNhanHangId;

    }


    parseNhanVienId(
        nhanVienId
    ) {

        const giaTri =
            Number(nhanVienId);

        if (
            !Number.isInteger(
                giaTri
            ) ||
            giaTri <= 0
        ) {

            throw new ApiError(
                401,
                "Tài khoản chưa được liên kết với nhân viên."
            );

        }

        return giaTri;

    }


    parseBooleanQuery(
        value,
        tenTruong
    ) {

        if (
            value === undefined ||
            value === ""
        ) {
            return undefined;
        }

        if (
            value === true ||
            value === "true"
        ) {
            return true;
        }

        if (
            value === false ||
            value === "false"
        ) {
            return false;
        }

        throw new ApiError(
            400,
            `${tenTruong} phải là true hoặc false.`
        );

    }


    getThongTinLoaiDiaDiem(
        loaiDiaDiem
    ) {

        const giaTri =
            Number(loaiDiaDiem);

        const loai =
            dsLoaiDiaDiemNhanHang.find(
                item =>
                    Number(item.value) ===
                    giaTri
            );

        if (!loai) {
            return null;
        }

        return {
            value:
                Number(loai.value),

            name:
                loai.name
        };

    }


    mapResponse(
        diaDiem
    ) {

        if (!diaDiem) {
            return null;
        }

        return {
            ...diaDiem,

            thongTinLoaiDiaDiem:
                this.getThongTinLoaiDiaDiem(
                    diaDiem.loaiDiaDiem
                )
        };

    }


    normalizeQuery(
        query = {}
    ) {

        const duLieu = {
            keyword:
                query.keyword
                    ? String(query.keyword).trim()
                    : "",

            loaiDiaDiem:
                query.loaiDiaDiem !== undefined &&
                query.loaiDiaDiem !== ""
                    ? Number(query.loaiDiaDiem)
                    : undefined,

            laMacDinh:
                this.parseBooleanQuery(
                    query.laMacDinh,
                    "Trạng thái mặc định"
                ),

            active:
                this.parseBooleanQuery(
                    query.active,
                    "Trạng thái hoạt động"
                )
        };

        if (
            duLieu.loaiDiaDiem !== undefined
        ) {

            this.validateLoaiDiaDiem(
                duLieu.loaiDiaDiem
            );

        }

        return duLieu;

    }


    async getTongHop(
        nhanVienId,
        query
    ) {

        const idNhanVien =
            this.parseNhanVienId(
                nhanVienId
            );

        const boLoc =
            this.normalizeQuery(
                query
            );

        const danhSach =
            await diaDiemNhanHangRepository
                .getTongHop(
                    idNhanVien,
                    boLoc
                );

        return danhSach.map(
            item =>
                this.mapResponse(item)
        );

    }


    async getChiTiet(
        id,
        nhanVienId
    ) {

        const diaDiemNhanHangId =
            this.parseId(id);

        const idNhanVien =
            this.parseNhanVienId(
                nhanVienId
            );

        const diaDiem =
            await diaDiemNhanHangRepository
                .getChiTiet(
                    diaDiemNhanHangId,
                    idNhanVien
                );

        if (!diaDiem) {

            throw new ApiError(
                404,
                "Địa điểm nhận hàng không tồn tại."
            );

        }

        return this.mapResponse(
            diaDiem
        );

    }


    validateLoaiDiaDiem(
        loaiDiaDiem
    ) {

        const hopLe =
            dsLoaiDiaDiemNhanHang.some(
                item =>
                    Number(item.value) ===
                    Number(loaiDiaDiem)
            );

        if (!hopLe) {

            throw new ApiError(
                400,
                "Loại địa điểm nhận hàng không hợp lệ."
            );

        }

    }


    async validateNhanVien(
        nhanVienId
    ) {

        const tonTai =
            await diaDiemNhanHangRepository
                .existsNhanVien(
                    nhanVienId
                );

        if (!tonTai) {

            throw new ApiError(
                400,
                "Nhân viên không tồn tại hoặc đã ngừng hoạt động."
            );

        }

    }


    async validateTrungDuLieu(
        nhanVienId,
        data,
        excludeId = null
    ) {

        const trungMa =
            await diaDiemNhanHangRepository
                .existsMaDiaDiem(
                    nhanVienId,
                    data.maDiaDiem,
                    excludeId
                );

        if (trungMa) {

            throw new ApiError(
                409,
                "Mã địa điểm đã tồn tại trong danh sách của bạn."
            );

        }

        const trungTen =
            await diaDiemNhanHangRepository
                .existsTenDiaDiem(
                    nhanVienId,
                    data.tenDiaDiem,
                    excludeId
                );

        if (trungTen) {

            throw new ApiError(
                409,
                "Tên địa điểm đã tồn tại trong danh sách của bạn."
            );

        }

    }


    validateMacDinh(
        data
    ) {

        if (
            data.laMacDinh === true &&
            data.active !== true
        ) {

            throw new ApiError(
                400,
                "Địa điểm mặc định phải ở trạng thái hoạt động."
            );

        }

    }


    async create(
        nhanVienId,
        data
    ) {

        const idNhanVien =
            this.parseNhanVienId(
                nhanVienId
            );

        const duLieuTao = {
            maDiaDiem:
                data.maDiaDiem.trim(),

            tenDiaDiem:
                data.tenDiaDiem.trim(),

            diaChiChiTiet:
                data.diaChiChiTiet.trim(),

            loaiDiaDiem:
                data.loaiDiaDiem !== undefined
                    ? Number(data.loaiDiaDiem)
                    : 20,

            laMacDinh:
                data.laMacDinh !== undefined
                    ? data.laMacDinh
                    : false,

            ghiChu:
                data.ghiChu?.trim() ||
                null,

            thuTuHienThi:
                data.thuTuHienThi !== undefined
                    ? Number(data.thuTuHienThi)
                    : 0,

            active:
                data.active !== undefined
                    ? data.active
                    : true
        };

        await this.validateNhanVien(
            idNhanVien
        );

        this.validateLoaiDiaDiem(
            duLieuTao.loaiDiaDiem
        );

        this.validateMacDinh(
            duLieuTao
        );

        await this.validateTrungDuLieu(
            idNhanVien,
            duLieuTao
        );

        try {

            const ketQua =
                await diaDiemNhanHangRepository
                    .create(
                        idNhanVien,
                        duLieuTao
                    );

            return this.mapResponse(
                ketQua
            );

        } catch (error) {

            this.handleDatabaseError(
                error
            );

            throw error;

        }

    }


    async update(
        id,
        nhanVienId,
        data
    ) {

        const diaDiemNhanHangId =
            this.parseId(id);

        const idNhanVien =
            this.parseNhanVienId(
                nhanVienId
            );

        const diaDiem =
            await diaDiemNhanHangRepository
                .getChiTiet(
                    diaDiemNhanHangId,
                    idNhanVien
                );

        if (!diaDiem) {

            throw new ApiError(
                404,
                "Địa điểm nhận hàng không tồn tại."
            );

        }

        const duLieuCapNhat = {
            maDiaDiem:
                data.maDiaDiem !== undefined
                    ? data.maDiaDiem.trim()
                    : diaDiem.maDiaDiem,

            tenDiaDiem:
                data.tenDiaDiem !== undefined
                    ? data.tenDiaDiem.trim()
                    : diaDiem.tenDiaDiem,

            diaChiChiTiet:
                data.diaChiChiTiet !== undefined
                    ? data.diaChiChiTiet.trim()
                    : diaDiem.diaChiChiTiet,

            loaiDiaDiem:
                data.loaiDiaDiem !== undefined
                    ? Number(data.loaiDiaDiem)
                    : Number(diaDiem.loaiDiaDiem),

            laMacDinh:
                data.laMacDinh !== undefined
                    ? data.laMacDinh
                    : diaDiem.laMacDinh,

            ghiChu:
                data.ghiChu !== undefined
                    ? data.ghiChu?.trim() || null
                    : diaDiem.ghiChu,

            thuTuHienThi:
                data.thuTuHienThi !== undefined
                    ? Number(data.thuTuHienThi)
                    : Number(diaDiem.thuTuHienThi),

            active:
                data.active !== undefined
                    ? data.active
                    : diaDiem.active
        };

        if (
            duLieuCapNhat.active === false
        ) {
            duLieuCapNhat.laMacDinh =
                false;
        }

        this.validateLoaiDiaDiem(
            duLieuCapNhat.loaiDiaDiem
        );

        this.validateMacDinh(
            duLieuCapNhat
        );

        await this.validateTrungDuLieu(
            idNhanVien,
            duLieuCapNhat,
            diaDiemNhanHangId
        );

        try {

            const ketQua =
                await diaDiemNhanHangRepository
                    .update(
                        diaDiemNhanHangId,
                        idNhanVien,
                        duLieuCapNhat
                    );

            if (!ketQua) {

                throw new ApiError(
                    404,
                    "Địa điểm nhận hàng không tồn tại."
                );

            }

            return this.mapResponse(
                ketQua
            );

        } catch (error) {

            this.handleDatabaseError(
                error
            );

            throw error;

        }

    }


    handleDatabaseError(
        error
    ) {

        if (
            error?.code !==
            "23505"
        ) {
            return;
        }

        if (
            error.constraint ===
            "uq_dm_dia_diem_nhan_hang_mac_dinh"
        ) {

            throw new ApiError(
                409,
                "Nhân viên đã có một địa điểm mặc định."
            );

        }

        if (
            error.constraint ===
            "uq_dm_dia_diem_nhan_hang"
        ) {

            throw new ApiError(
                409,
                "Mã địa điểm đã tồn tại trong danh sách của bạn."
            );

        }

    }

}


module.exports =
    new DiaDiemNhanHangService();
