const ApiError =
    require(
        "../../../../utils/api-error"
    );

const sanPhamRepository =
    require(
        "./san-pham.repository"
    );


class SanPhamService {

    parseId(
        id
    ) {

        const sanPhamId =
            Number(id);

        if (
            !Number.isInteger(
                sanPhamId
            ) ||
            sanPhamId <= 0
        ) {

            throw new ApiError(
                400,
                "ID sản phẩm không hợp lệ."
            );

        }

        return sanPhamId;

    }


    validateDuLieuBatBuoc(
        data
    ) {

        if (
            !data.maSanPham
        ) {

            throw new ApiError(
                400,
                "Mã sản phẩm là bắt buộc."
            );

        }

        if (
            !data.tenSanPham
        ) {

            throw new ApiError(
                400,
                "Tên sản phẩm là bắt buộc."
            );

        }

        if (
            !Number.isInteger(
                data.nhomSanPhamId
            ) ||
            data.nhomSanPhamId <= 0
        ) {

            throw new ApiError(
                400,
                "Nhóm sản phẩm là bắt buộc."
            );

        }

        if (
            !Number.isFinite(
                data.giaBan
            ) ||
            data.giaBan < 0
        ) {

            throw new ApiError(
                400,
                "Giá bán không hợp lệ."
            );

        }

    }


    validateSoLuong(
        data
    ) {

        if (
            !Number.isFinite(
                data.soLuongToiThieu
            ) ||
            data.soLuongToiThieu <= 0
        ) {

            throw new ApiError(
                400,
                "Số lượng tối thiểu phải lớn hơn 0."
            );

        }

        if (
            data.soLuongToiDa !== null &&
            (
                !Number.isFinite(
                    data.soLuongToiDa
                ) ||
                data.soLuongToiDa <
                    data.soLuongToiThieu
            )
        ) {

            throw new ApiError(
                400,
                "Số lượng tối đa phải lớn hơn hoặc bằng số lượng tối thiểu."
            );

        }

        if (
            !Number.isFinite(
                data.buocSoLuong
            ) ||
            data.buocSoLuong <= 0
        ) {

            throw new ApiError(
                400,
                "Bước số lượng phải lớn hơn 0."
            );

        }

    }


    validateSoNguyenKhongAm(
        value,
        fieldName
    ) {

        if (
            !Number.isInteger(
                value
            ) ||
            value < 0
        ) {

            throw new ApiError(
                400,
                `${fieldName} phải là số nguyên không âm.`
            );

        }

    }


    async getTongHop(
        query
    ) {

        return await sanPhamRepository
            .getTongHop(
                query
            );

    }


    async getChiTiet(
        id
    ) {

        const sanPhamId =
            this.parseId(
                id
            );

        const sanPham =
            await sanPhamRepository
                .getChiTiet(
                    sanPhamId
                );

        if (!sanPham) {

            throw new ApiError(
                404,
                "Sản phẩm không tồn tại."
            );

        }

        return sanPham;

    }


    async validateTrungDuLieu(
        data,
        excludeId = null
    ) {

        const trungMa =
            await sanPhamRepository
                .existsMaSanPham(
                    data.maSanPham,
                    excludeId
                );

        if (trungMa) {

            throw new ApiError(
                409,
                "Mã sản phẩm đã tồn tại."
            );

        }

        const trungTen =
            await sanPhamRepository
                .existsTenSanPham(
                    data.tenSanPham,
                    excludeId
                );

        if (trungTen) {

            throw new ApiError(
                409,
                "Tên sản phẩm đã tồn tại."
            );

        }

    }


    async validateDanhMucLienQuan(
        data
    ) {

        const [
            nhomSanPhamTonTai,
            donViTinhTonTai
        ] =
            await Promise.all([

                sanPhamRepository
                    .existsNhomSanPham(
                        data.nhomSanPhamId
                    ),

                sanPhamRepository
                    .existsDonViTinh(
                        data.donViTinhId
                    )

            ]);

        if (!nhomSanPhamTonTai) {

            throw new ApiError(
                400,
                "Nhóm sản phẩm không tồn tại hoặc đã ngừng hoạt động."
            );

        }

        if (!donViTinhTonTai) {

            throw new ApiError(
                400,
                "Đơn vị tính không tồn tại hoặc đã ngừng hoạt động."
            );

        }

    }


    normalizeCreateData(
        data
    ) {

        return {

            maSanPham:
                String(
                    data.maSanPham ||
                    ""
                ).trim(),

            tenSanPham:
                String(
                    data.tenSanPham ||
                    ""
                ).trim(),

            nhomSanPhamId:
                Number(
                    data.nhomSanPhamId
                ),

            donViTinhId:
                data.donViTinhId !== undefined &&
                data.donViTinhId !== null
                    ? Number(
                        data.donViTinhId
                    )
                    : null,

            giaBan:
                Number(
                    data.giaBan
                ),

            moTa:
                data.moTa !== undefined &&
                data.moTa !== null
                    ? String(
                        data.moTa
                    ).trim() || null
                    : null,

            hinhAnh:
                data.hinhAnh !== undefined &&
                data.hinhAnh !== null
                    ? String(
                        data.hinhAnh
                    ).trim() || null
                    : null,

            choPhepDat:
                data.choPhepDat !== undefined
                    ? data.choPhepDat
                    : true,

            laSanPhamMoi:
                data.laSanPhamMoi !== undefined
                    ? data.laSanPhamMoi
                    : false,

            laSanPhamNoiBat:
                data.laSanPhamNoiBat !== undefined
                    ? data.laSanPhamNoiBat
                    : false,

            soLuongToiThieu:
                data.soLuongToiThieu !== undefined
                    ? Number(
                        data.soLuongToiThieu
                    )
                    : 1,

            soLuongToiDa:
                data.soLuongToiDa !== undefined &&
                data.soLuongToiDa !== null
                    ? Number(
                        data.soLuongToiDa
                    )
                    : null,

            buocSoLuong:
                data.buocSoLuong !== undefined
                    ? Number(
                        data.buocSoLuong
                    )
                    : 1,

            thoiGianChuanBiPhut:
                data.thoiGianChuanBiPhut !== undefined
                    ? Number(
                        data.thoiGianChuanBiPhut
                    )
                    : 0,

            thuTuHienThi:
                data.thuTuHienThi !== undefined
                    ? Number(
                        data.thuTuHienThi
                    )
                    : 0,

            active:
                data.active !== undefined
                    ? data.active
                    : true

        };

    }


    async create(
        data
    ) {

        const duLieuTao =
            this.normalizeCreateData(
                data
            );

        this.validateDuLieuBatBuoc(
            duLieuTao
        );

        this.validateSoLuong(
            duLieuTao
        );

        this.validateSoNguyenKhongAm(
            duLieuTao.thoiGianChuanBiPhut,
            "Thời gian chuẩn bị"
        );

        this.validateSoNguyenKhongAm(
            duLieuTao.thuTuHienThi,
            "Thứ tự hiển thị"
        );

        await this.validateTrungDuLieu(
            duLieuTao
        );

        await this.validateDanhMucLienQuan(
            duLieuTao
        );

        return await sanPhamRepository
            .create(
                duLieuTao
            );

    }


    async update(
        id,
        data
    ) {

        const sanPhamId =
            this.parseId(
                id
            );

        const sanPham =
            await sanPhamRepository
                .getChiTiet(
                    sanPhamId
                );

        if (!sanPham) {

            throw new ApiError(
                404,
                "Sản phẩm không tồn tại."
            );

        }

        const duLieuCapNhat = {

            maSanPham:
                data.maSanPham !== undefined
                    ? String(
                        data.maSanPham
                    ).trim()
                    : sanPham.maSanPham,

            tenSanPham:
                data.tenSanPham !== undefined
                    ? String(
                        data.tenSanPham
                    ).trim()
                    : sanPham.tenSanPham,

            nhomSanPhamId:
                data.nhomSanPhamId !== undefined
                    ? Number(
                        data.nhomSanPhamId
                    )
                    : Number(
                        sanPham.nhomSanPhamId
                    ),

            donViTinhId:
                data.donViTinhId !== undefined
                    ? (
                        data.donViTinhId === null
                            ? null
                            : Number(
                                data.donViTinhId
                            )
                    )
                    : sanPham.donViTinhId,

            giaBan:
                data.giaBan !== undefined
                    ? Number(
                        data.giaBan
                    )
                    : Number(
                        sanPham.giaBan
                    ),

            moTa:
                data.moTa !== undefined
                    ? (
                        data.moTa === null
                            ? null
                            : String(
                                data.moTa
                            ).trim() || null
                    )
                    : sanPham.moTa,

            hinhAnh:
                data.hinhAnh !== undefined
                    ? (
                        data.hinhAnh === null
                            ? null
                            : String(
                                data.hinhAnh
                            ).trim() || null
                    )
                    : sanPham.hinhAnh,

            choPhepDat:
                data.choPhepDat !== undefined
                    ? data.choPhepDat
                    : sanPham.choPhepDat,

            laSanPhamMoi:
                data.laSanPhamMoi !== undefined
                    ? data.laSanPhamMoi
                    : sanPham.laSanPhamMoi,

            laSanPhamNoiBat:
                data.laSanPhamNoiBat !== undefined
                    ? data.laSanPhamNoiBat
                    : sanPham.laSanPhamNoiBat,

            soLuongToiThieu:
                data.soLuongToiThieu !== undefined
                    ? Number(
                        data.soLuongToiThieu
                    )
                    : Number(
                        sanPham.soLuongToiThieu
                    ),

            soLuongToiDa:
                data.soLuongToiDa !== undefined
                    ? (
                        data.soLuongToiDa === null
                            ? null
                            : Number(
                                data.soLuongToiDa
                            )
                    )
                    : (
                        sanPham.soLuongToiDa === null
                            ? null
                            : Number(
                                sanPham.soLuongToiDa
                            )
                    ),

            buocSoLuong:
                data.buocSoLuong !== undefined
                    ? Number(
                        data.buocSoLuong
                    )
                    : Number(
                        sanPham.buocSoLuong
                    ),

            thoiGianChuanBiPhut:
                data.thoiGianChuanBiPhut !== undefined
                    ? Number(
                        data.thoiGianChuanBiPhut
                    )
                    : Number(
                        sanPham.thoiGianChuanBiPhut
                    ),

            thuTuHienThi:
                data.thuTuHienThi !== undefined
                    ? Number(
                        data.thuTuHienThi
                    )
                    : Number(
                        sanPham.thuTuHienThi
                    ),

            active:
                data.active !== undefined
                    ? data.active
                    : sanPham.active

        };

        this.validateDuLieuBatBuoc(
            duLieuCapNhat
        );

        this.validateSoLuong(
            duLieuCapNhat
        );

        this.validateSoNguyenKhongAm(
            duLieuCapNhat.thoiGianChuanBiPhut,
            "Thời gian chuẩn bị"
        );

        this.validateSoNguyenKhongAm(
            duLieuCapNhat.thuTuHienThi,
            "Thứ tự hiển thị"
        );

        await this.validateTrungDuLieu(
            duLieuCapNhat,
            sanPhamId
        );

        await this.validateDanhMucLienQuan(
            duLieuCapNhat
        );

        const ketQua =
            await sanPhamRepository
                .update(
                    sanPhamId,
                    duLieuCapNhat
                );

        if (!ketQua) {

            throw new ApiError(
                404,
                "Sản phẩm không tồn tại."
            );

        }

        return ketQua;

    }

}


module.exports =
    new SanPhamService();