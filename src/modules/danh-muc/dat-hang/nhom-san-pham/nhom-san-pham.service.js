const {
    loaiSanPham:
        dsLoaiSanPham
} = require(
    "../../../../constants/enums"
);

const ApiError =
    require(
        "../../../../utils/api-error"
    );

const nhomSanPhamRepository =
    require(
        "./nhom-san-pham.repository"
    );


class NhomSanPhamService {

    parseId(
        id
    ) {

        const nhomSanPhamId =
            Number(id);

        if (
            !Number.isInteger(
                nhomSanPhamId
            ) ||
            nhomSanPhamId <= 0
        ) {

            throw new ApiError(
                400,
                "ID nhóm sản phẩm không hợp lệ."
            );

        }

        return nhomSanPhamId;

    }


    validateLoaiSanPham(
        loaiSanPham
    ) {

        const hopLe =
            dsLoaiSanPham.some(
                item =>
                    Number(
                        item.value
                    ) ===
                    Number(
                        loaiSanPham
                    )
            );

        if (!hopLe) {

            throw new ApiError(
                400,
                "Loại sản phẩm không hợp lệ."
            );

        }

    }


    validateDuLieuBatBuoc(
        data
    ) {

        if (
            !data.maNhomSanPham
        ) {

            throw new ApiError(
                400,
                "Mã nhóm sản phẩm là bắt buộc."
            );

        }

        if (
            !data.tenNhomSanPham
        ) {

            throw new ApiError(
                400,
                "Tên nhóm sản phẩm là bắt buộc."
            );

        }

        if (
            data.loaiSanPham === undefined ||
            data.loaiSanPham === null ||
            data.loaiSanPham === ""
        ) {

            throw new ApiError(
                400,
                "Loại sản phẩm là bắt buộc."
            );

        }

    }


    async getTongHop(
        query
    ) {

        return await nhomSanPhamRepository
            .getTongHop(
                query
            );

    }


    async getChiTiet(
        id
    ) {

        const nhomSanPhamId =
            this.parseId(
                id
            );

        const nhomSanPham =
            await nhomSanPhamRepository
                .getChiTiet(
                    nhomSanPhamId
                );

        if (!nhomSanPham) {

            throw new ApiError(
                404,
                "Nhóm sản phẩm không tồn tại."
            );

        }

        return nhomSanPham;

    }


    async validateTrungDuLieu(
        data,
        excludeId = null
    ) {

        const trungMa =
            await nhomSanPhamRepository
                .existsMaNhomSanPham(
                    data.maNhomSanPham,
                    excludeId
                );

        if (trungMa) {

            throw new ApiError(
                409,
                "Mã nhóm sản phẩm đã tồn tại."
            );

        }

        const trungTen =
            await nhomSanPhamRepository
                .existsTenNhomSanPham(
                    data.tenNhomSanPham,
                    excludeId
                );

        if (trungTen) {

            throw new ApiError(
                409,
                "Tên nhóm sản phẩm đã tồn tại."
            );

        }

    }


    async create(
        data
    ) {

        const duLieuTao = {

            maNhomSanPham:
                String(
                    data.maNhomSanPham ||
                    ""
                ).trim(),

            tenNhomSanPham:
                String(
                    data.tenNhomSanPham ||
                    ""
                ).trim(),

            loaiSanPham:
                data.loaiSanPham !== undefined
                    ? Number(
                        data.loaiSanPham
                    )
                    : undefined,

            moTa:
                data.moTa !== undefined &&
                data.moTa !== null
                    ? String(
                        data.moTa
                    ).trim() || null
                    : null,

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

        this.validateDuLieuBatBuoc(
            duLieuTao
        );

        this.validateLoaiSanPham(
            duLieuTao.loaiSanPham
        );

        await this.validateTrungDuLieu(
            duLieuTao
        );

        return await nhomSanPhamRepository
            .create(
                duLieuTao
            );

    }


    async update(
        id,
        data
    ) {

        const nhomSanPhamId =
            this.parseId(
                id
            );

        const nhomSanPham =
            await nhomSanPhamRepository
                .getChiTiet(
                    nhomSanPhamId
                );

        if (!nhomSanPham) {

            throw new ApiError(
                404,
                "Nhóm sản phẩm không tồn tại."
            );

        }

        const duLieuCapNhat = {

            maNhomSanPham:
                data.maNhomSanPham !== undefined
                    ? String(
                        data.maNhomSanPham
                    ).trim()
                    : nhomSanPham.maNhomSanPham,

            tenNhomSanPham:
                data.tenNhomSanPham !== undefined
                    ? String(
                        data.tenNhomSanPham
                    ).trim()
                    : nhomSanPham.tenNhomSanPham,

            loaiSanPham:
                data.loaiSanPham !== undefined
                    ? Number(
                        data.loaiSanPham
                    )
                    : Number(
                        nhomSanPham.loaiSanPham
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
                    : nhomSanPham.moTa,

            thuTuHienThi:
                data.thuTuHienThi !== undefined
                    ? Number(
                        data.thuTuHienThi
                    )
                    : Number(
                        nhomSanPham.thuTuHienThi
                    ),

            active:
                data.active !== undefined
                    ? data.active
                    : nhomSanPham.active

        };

        this.validateDuLieuBatBuoc(
            duLieuCapNhat
        );

        this.validateLoaiSanPham(
            duLieuCapNhat.loaiSanPham
        );

        await this.validateTrungDuLieu(
            duLieuCapNhat,
            nhomSanPhamId
        );

        const ketQua =
            await nhomSanPhamRepository
                .update(
                    nhomSanPhamId,
                    duLieuCapNhat
                );

        if (!ketQua) {

            throw new ApiError(
                404,
                "Nhóm sản phẩm không tồn tại."
            );

        }

        return ketQua;

    }

}


module.exports =
    new NhomSanPhamService();