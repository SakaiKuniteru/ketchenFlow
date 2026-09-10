"use strict";

const ApiError =
    require("../../../../utils/api-error");

const {
    loaiGiamVoucherDonHang,
    phamViApDungVoucherDonHang
} = require("../../../../constants/enums");

const voucherDonHangRepository =
    require("./voucher-don-hang.repository");

const PHAN_TRAM = 10;
const TOAN_BO_DON_HANG = 10;
const NHOM_SAN_PHAM = 20;
const SAN_PHAM_CU_THE = 30;

function getEnumInfo(
    danhSach,
    value
) {
    return danhSach.find(
        item =>
            Number(item.value) ===
            Number(value)
    ) || null;
}

function uniqueIds(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return [
        ...new Set(
            value.map(Number)
        )
    ];
}

function enrichVoucher(voucher) {
    if (!voucher) {
        return null;
    }

    return {
        ...voucher,

        thongTinLoaiGiam:
            getEnumInfo(
                loaiGiamVoucherDonHang,
                voucher.loaiGiam
            ),

        thongTinPhamViApDung:
            getEnumInfo(
                phamViApDungVoucherDonHang,
                voucher.phamViApDung
            )
    };
}

class VoucherDonHangService {

    parseId(id) {
        const voucherId = Number(id);

        if (
            !Number.isInteger(voucherId) ||
            voucherId <= 0
        ) {
            throw new ApiError(
                400,
                "ID voucher đơn hàng không hợp lệ."
            );
        }

        return voucherId;
    }

    async getTongHop(query) {
        const danhSach =
            await voucherDonHangRepository
                .getTongHop(query);

        return danhSach.map(
            enrichVoucher
        );
    }

    async getChiTiet(id) {
        const voucherId =
            this.parseId(id);

        const voucher =
            await voucherDonHangRepository
                .getChiTiet(voucherId);

        if (!voucher) {
            throw new ApiError(
                404,
                "Voucher đơn hàng không tồn tại."
            );
        }

        return enrichVoucher(voucher);
    }

    normalize(
        data,
        current = {}
    ) {
        const getValue = (
            key,
            defaultValue = undefined
        ) => {
            if (data[key] !== undefined) {
                return data[key];
            }

            if (current[key] !== undefined) {
                return current[key];
            }

            return defaultValue;
        };

        const result = {
            maVoucher:
                getValue("maVoucher")
                    ?.trim(),

            tenVoucher:
                getValue("tenVoucher")
                    ?.trim(),

            moTa:
                getValue("moTa", null)
                    ?.trim() || null,

            loaiGiam:
                Number(
                    getValue("loaiGiam")
                ),

            giaTri:
                Number(
                    getValue("giaTri")
                ),

            giamToiDa:
                getValue("giamToiDa", null) === null
                    ? null
                    : Number(
                        getValue("giamToiDa")
                    ),

            giaTriDonHangToiThieu:
                Number(
                    getValue(
                        "giaTriDonHangToiThieu",
                        0
                    )
                ),

            soLuongPhatHanh:
                getValue(
                    "soLuongPhatHanh",
                    null
                ) === null
                    ? null
                    : Number(
                        getValue(
                            "soLuongPhatHanh"
                        )
                    ),

            soLuotMoiNhanVien:
                getValue(
                    "soLuotMoiNhanVien",
                    1
                ) === null
                    ? null
                    : Number(
                        getValue(
                            "soLuotMoiNhanVien"
                        )
                    ),

            phamViApDung:
                Number(
                    getValue(
                        "phamViApDung",
                        TOAN_BO_DON_HANG
                    )
                ),

            choPhepDungChung:
                Boolean(
                    getValue(
                        "choPhepDungChung",
                        false
                    )
                ),

            tuDongApDung:
                Boolean(
                    getValue(
                        "tuDongApDung",
                        false
                    )
                ),

            thoiGianBatDau:
                getValue("thoiGianBatDau"),

            thoiGianKetThuc:
                getValue("thoiGianKetThuc"),

            active:
                Boolean(
                    getValue("active", true)
                ),

            nguoiTaoId:
                getValue("nguoiTaoId"),

            nhomSanPhamIds:
                uniqueIds(
                    getValue(
                        "nhomSanPhamIds",
                        []
                    )
                ),

            sanPhamIds:
                uniqueIds(
                    getValue(
                        "sanPhamIds",
                        []
                    )
                ),

            coSoIds:
                uniqueIds(
                    getValue(
                        "coSoIds",
                        []
                    )
                ),

            phongBanIds:
                uniqueIds(
                    getValue(
                        "phongBanIds",
                        []
                    )
                ),

            chucVuIds:
                uniqueIds(
                    getValue(
                        "chucVuIds",
                        []
                    )
                ),

            nhanVienIds:
                uniqueIds(
                    getValue(
                        "nhanVienIds",
                        []
                    )
                )
        };

        if (
            result.phamViApDung ===
            TOAN_BO_DON_HANG
        ) {
            result.nhomSanPhamIds = [];
            result.sanPhamIds = [];
        }

        if (
            result.phamViApDung ===
            NHOM_SAN_PHAM
        ) {
            result.sanPhamIds = [];
        }

        if (
            result.phamViApDung ===
            SAN_PHAM_CU_THE
        ) {
            result.nhomSanPhamIds = [];
        }

        return result;
    }

    validateEnum(data) {
        if (
            !getEnumInfo(
                loaiGiamVoucherDonHang,
                data.loaiGiam
            )
        ) {
            throw new ApiError(
                400,
                "Loại giảm voucher đơn hàng không hợp lệ."
            );
        }

        if (
            !getEnumInfo(
                phamViApDungVoucherDonHang,
                data.phamViApDung
            )
        ) {
            throw new ApiError(
                400,
                "Phạm vi áp dụng voucher không hợp lệ."
            );
        }
    }

    validateGiaTri(data) {
        if (
            !Number.isFinite(data.giaTri) ||
            data.giaTri <= 0
        ) {
            throw new ApiError(
                400,
                "Giá trị giảm phải lớn hơn 0."
            );
        }

        if (
            data.loaiGiam === PHAN_TRAM &&
            data.giaTri > 100
        ) {
            throw new ApiError(
                400,
                "Giá trị giảm theo phần trăm không được vượt quá 100."
            );
        }

        if (
            data.giamToiDa !== null &&
            (
                !Number.isFinite(
                    data.giamToiDa
                ) ||
                data.giamToiDa < 0
            )
        ) {
            throw new ApiError(
                400,
                "Giảm tối đa phải lớn hơn hoặc bằng 0."
            );
        }

        if (
            !Number.isFinite(
                data.giaTriDonHangToiThieu
            ) ||
            data.giaTriDonHangToiThieu < 0
        ) {
            throw new ApiError(
                400,
                "Giá trị đơn hàng tối thiểu không hợp lệ."
            );
        }
    }

    validateSoLuong(data) {
        for (const [
            value,
            message
        ] of [
            [
                data.soLuongPhatHanh,
                "Số lượng phát hành phải là số nguyên lớn hơn 0."
            ],
            [
                data.soLuotMoiNhanVien,
                "Số lượt mỗi nhân viên phải là số nguyên lớn hơn 0."
            ]
        ]) {
            if (
                value !== null &&
                (
                    !Number.isInteger(value) ||
                    value <= 0
                )
            ) {
                throw new ApiError(
                    400,
                    message
                );
            }
        }
    }

    validateThoiGian(data) {
        const batDau =
            new Date(
                data.thoiGianBatDau
            );

        const ketThuc =
            new Date(
                data.thoiGianKetThuc
            );

        if (
            Number.isNaN(
                batDau.getTime()
            ) ||
            Number.isNaN(
                ketThuc.getTime()
            )
        ) {
            throw new ApiError(
                400,
                "Thời gian áp dụng voucher không hợp lệ."
            );
        }

        if (batDau >= ketThuc) {
            throw new ApiError(
                400,
                "Thời gian kết thúc phải lớn hơn thời gian bắt đầu."
            );
        }
    }

    validatePhamVi(data) {
        if (
            data.phamViApDung ===
                NHOM_SAN_PHAM &&
            data.nhomSanPhamIds.length === 0
        ) {
            throw new ApiError(
                400,
                "Voucher theo nhóm phải chọn ít nhất một nhóm sản phẩm."
            );
        }

        if (
            data.phamViApDung ===
                SAN_PHAM_CU_THE &&
            data.sanPhamIds.length === 0
        ) {
            throw new ApiError(
                400,
                "Voucher theo sản phẩm phải chọn ít nhất một sản phẩm."
            );
        }
    }

    async validateTrungDuLieu(
        data,
        excludeId = null
    ) {
        const [
            trungMa,
            trungTen
        ] = await Promise.all([
            voucherDonHangRepository
                .existsMaVoucher(
                    data.maVoucher,
                    excludeId
                ),

            voucherDonHangRepository
                .existsTenVoucher(
                    data.tenVoucher,
                    excludeId
                )
        ]);

        if (trungMa) {
            throw new ApiError(
                409,
                "Mã voucher đơn hàng đã tồn tại."
            );
        }

        if (trungTen) {
            throw new ApiError(
                409,
                "Tên voucher đơn hàng đã tồn tại."
            );
        }
    }

    async validateRelationIds(data) {
        const invalidRelations =
            await voucherDonHangRepository
                .getInvalidRelationIds(data);

        if (invalidRelations.length === 0) {
            return;
        }

        const message =
            invalidRelations
                .map(
                    item =>
                        `${item.key}: ${item.ids.join(", ")}`
                )
                .join("; ");

        throw new ApiError(
            400,
            `Danh sách liên kết không tồn tại hoặc đã ngừng sử dụng: ${message}.`
        );
    }

    async validate(
        data,
        excludeId = null
    ) {
        this.validateEnum(data);
        this.validateGiaTri(data);
        this.validateSoLuong(data);
        this.validateThoiGian(data);
        this.validatePhamVi(data);

        await this.validateTrungDuLieu(
            data,
            excludeId
        );

        await this.validateRelationIds(
            data
        );
    }

    async create(
        data,
        user
    ) {
        const nguoiTaoId =
            user?.nhanVienId ||
            user?.nhan_vien_id;

        if (!nguoiTaoId) {
            throw new ApiError(
                400,
                "Tài khoản chưa liên kết với nhân viên."
            );
        }

        const duLieuTao =
            this.normalize({
                ...data,
                nguoiTaoId:
                    Number(nguoiTaoId)
            });

        await this.validate(
            duLieuTao
        );

        const result =
            await voucherDonHangRepository
                .create(duLieuTao);

        return enrichVoucher(result);
    }

    async update(
        id,
        data
    ) {
        const voucherId =
            this.parseId(id);

        const current =
            await voucherDonHangRepository
                .getChiTiet(voucherId);

        if (!current) {
            throw new ApiError(
                404,
                "Voucher đơn hàng không tồn tại."
            );
        }

        const duLieuCapNhat =
            this.normalize(
                data,
                current
            );

        await this.validate(
            duLieuCapNhat,
            voucherId
        );

        const result =
            await voucherDonHangRepository
                .update(
                    voucherId,
                    duLieuCapNhat
                );

        return enrichVoucher(result);
    }
}

module.exports =
    new VoucherDonHangService();