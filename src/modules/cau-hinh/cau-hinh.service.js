"use strict";

const ApiError = require("../../utils/api-error");
const cauHinhRepository = require("./cau-hinh.repository");

const MA_THIET_LAP = {
    TEN_HE_THONG: "TEN_HE_THONG",
    LOGO_CO_SO_MAC_DINH: "LOGO_CO_SO_MAC_DINH",
    SO_LAN_DANG_NHAP_SAI_TOI_DA: "SO_LAN_DANG_NHAP_SAI_TOI_DA",
    THOI_GIAN_KHOA_TAI_KHOAN: "THOI_GIAN_KHOA_TAI_KHOAN",
    THOI_GIAN_ACCESS_TOKEN: "THOI_GIAN_ACCESS_TOKEN",
    THOI_GIAN_REFRESH_TOKEN: "THOI_GIAN_REFRESH_TOKEN",
    THOI_GIAN_TIMEOUT: "THOI_GIAN_TIMEOUT",
    SIDEBAR_MAC_DINH_DONG: "SIDEBAR_MAC_DINH_DONG",
    NGAY_BAT_DAU_TUAN_THUC_DON: "NGAY_BAT_DAU_TUAN_THUC_DON",
    THUC_DON_BAT_BUOC_DU_SO_NGAY: "THUC_DON_BAT_BUOC_DU_SO_NGAY",
    SO_TUAN_HIEN_THI_THUC_DON: "SO_TUAN_HIEN_THI_THUC_DON",
    SO_NAM_HIEN_THI_THUC_DON_THANG: "SO_NAM_HIEN_THI_THUC_DON_THANG",
    QUY_TAC_CHON_DON_VI_QUY_DOI: "QUY_TAC_CHON_DON_VI_QUY_DOI",
    QUY_TAC_LAM_TRON: "QUY_TAC_LAM_TRON",
    SO_CHU_SO_SAU_DAU_PHAY: "SO_CHU_SO_SAU_DAU_PHAY",
    BAT_BUOC_CHON_NHOM_MON: "BAT_BUOC_CHON_NHOM_MON",
    THU_TU_DOI_TUONG_LAY_VE: "THU_TU_DOI_TUONG_LAY_VE",
    PHUONG_THUC_THANH_TOAN_HIEN_THI: "PHUONG_THUC_THANH_TOAN_HIEN_THI",
    DINH_DANG_MA_VE_AN: "DINH_DANG_MA_VE_AN",
    SO_PHUT_DAT_HANG_TRUOC: "SO_PHUT_DAT_HANG_TRUOC"
};

class CauHinhService {
    async getGiaTriPublic(ma) {
        if (!ma) {
            throw new ApiError(
                400,
                "Mã thiết lập không được để trống."
            );
        }

        const maThietLap = String(ma)
            .trim()
            .toUpperCase();

        const PUBLIC_SETTINGS = new Set([
            MA_THIET_LAP.TEN_HE_THONG,
            MA_THIET_LAP.LOGO_CO_SO_MAC_DINH
        ]);

        if (!PUBLIC_SETTINGS.has(maThietLap)) {
            throw new ApiError(
                403,
                "Thiết lập này không được phép truy cập công khai."
            );
        }

        return this.getGiaTri(maThietLap);
    }

    async getGiaTri(ma) {
        if (!ma) {
            throw new ApiError(
                400,
                "Mã thiết lập không được để trống."
            );
        }

        const maThietLap = String(ma)
            .trim()
            .toUpperCase();

        const thietLap = await cauHinhRepository.getThietLapByMa(maThietLap);

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            throw new ApiError(
                404,
                "Không tìm thấy thiết lập hoặc thiết lập đang tắt."
            );
        }

        switch (maThietLap) {
            case MA_THIET_LAP.LOGO_CO_SO_MAC_DINH:
                return this.resolveLogoCoSoMacDinh(thietLap);

            case MA_THIET_LAP.SIDEBAR_MAC_DINH_DONG:
                return {
                    ma: maThietLap,
                    giaTri: await this.getSidebarDongMacDinh()
                };

            case MA_THIET_LAP.NGAY_BAT_DAU_TUAN_THUC_DON:
                return {
                    ma: maThietLap,
                    giaTri: await this.getThucDonTuanBatDauThuBay()
                };

            case MA_THIET_LAP.THUC_DON_BAT_BUOC_DU_SO_NGAY:
                return {
                    ma: maThietLap,
                    giaTri: await this.getThucDonBatBuocDuSoNgay()
                };

            case MA_THIET_LAP.SO_TUAN_HIEN_THI_THUC_DON:
                return {
                    ma: maThietLap,
                    giaTri: await this.getSoTuanHienThiThucDon()
                };

            case MA_THIET_LAP.SO_NAM_HIEN_THI_THUC_DON_THANG:
                return {
                    ma: maThietLap,
                    giaTri: await this.getSoNamHienThiThucDonThang()
                };
            
            case MA_THIET_LAP.QUY_TAC_CHON_DON_VI_QUY_DOI:
                return {
                    ma: maThietLap,
                    giaTri: await this.getQuyTacChonDonViQuyDoi()
                };

            case MA_THIET_LAP.QUY_TAC_LAM_TRON:
                return {
                    ma: maThietLap,
                    giaTri: await this.getQuyTacLamTron()
                };

            case MA_THIET_LAP.SO_CHU_SO_SAU_DAU_PHAY:
                return {
                    ma: maThietLap,
                    giaTri: await this.getSoChuSoSauDauPhay()
                };

            case MA_THIET_LAP.BAT_BUOC_CHON_NHOM_MON:
                return {
                    ma: maThietLap,
                    giaTri: await this.getBatBuocChonNhomMon()
                };

            case MA_THIET_LAP.THU_TU_DOI_TUONG_LAY_VE:
                return {
                    ma: maThietLap,
                    giaTri: await this.getThuTuDoiTuongLayVe()
                };

            case MA_THIET_LAP.PHUONG_THUC_THANH_TOAN_HIEN_THI:
                return {
                    ma: maThietLap,
                    giaTri: await this.getPhuongThucThanhToanHienThi()
                };

            case MA_THIET_LAP.DINH_DANG_MA_VE_AN:
                return {
                    ma: maThietLap,
                    giaTri: await this.getDinhDangMaVeAn()
                };

            case MA_THIET_LAP.SO_PHUT_DAT_HANG_TRUOC:
                return {
                    ma: maThietLap,
                    giaTri: await this.getSoPhutDatHangTruoc()
                };

                    default: return this.resolveMacDinh(thietLap);
                }
            }

    async resolveLogoCoSoMacDinh(thietLap) {
        const maCoSo = thietLap.gia_tri?.trim();

        if (!maCoSo) {
            throw new ApiError(
                404,
                "Chưa thiết lập cơ sở mặc định."
            );
        }

        const coSo = await cauHinhRepository.getCoSoByMa(maCoSo);

        if (!coSo) {
            throw new ApiError(
                404,
                "Không tìm thấy cơ sở mặc định."
            );
        }

        return {
            ma: thietLap.ma_thiet_lap,
            giaTri: coSo.logo
        };
    }

    resolveMacDinh(thietLap) {
        return {
            ma: thietLap.ma_thiet_lap,
            giaTri: thietLap.gia_tri
        };
    }

    async getSoLanDangNhapSaiToiDa() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.SO_LAN_DANG_NHAP_SAI_TOI_DA
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return null;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return null;
        }

        const soLan = Number(giaTri);

        if (
            !Number.isInteger(soLan) ||
            soLan <= 0
        ) {
            return null;
        }

        return soLan;
    }

    async getThoiGianKhoaTaiKhoan() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_KHOA_TAI_KHOAN
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return null;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        )
            .trim()
            .toLowerCase();

        const match = giaTri.match(
            /^(\d+)\/(phut|gio|ngay|thang|nam)$/
        );

        if (!match) {
            return null;
        }

        const soLuong = Number(match[1]);
        const donVi = match[2];

        if (
            !Number.isInteger(soLuong) ||
            soLuong <= 0
        ) {
            return null;
        }

        return {
            soLuong,
            donVi
        };
    }

    async getSoPhutRefreshToken() {
        const MAC_DINH = 20;

        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_REFRESH_TOKEN
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return MAC_DINH;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soPhut = Number(giaTri);

        if (
            !Number.isInteger(soPhut) ||
            soPhut <= 0
        ) {
            return MAC_DINH;
        }

        return soPhut;
    }

    async getThoiGianTimeout() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_TIMEOUT
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return null;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return null;
        }

        const soPhut = Number(giaTri);

        if (
            !Number.isInteger(soPhut) ||
            soPhut <= 10
        ) {
            return null;
        }

        return soPhut;
    }

    async getSoPhutAccessToken() {
        const MAC_DINH = 20;

        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THOI_GIAN_ACCESS_TOKEN
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return MAC_DINH;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soPhut = Number(giaTri);

        if (
            !Number.isInteger(soPhut) ||
            soPhut <= 0
        ) {
            return MAC_DINH;
        }

        return soPhut;
    }

    async getSidebarDongMacDinh() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.SIDEBAR_MAC_DINH_DONG
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return false;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        )
            .trim()
            .toLowerCase();

        return giaTri === "true";
    }

    async getThucDonTuanBatDauThuBay() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.NGAY_BAT_DAU_TUAN_THUC_DON
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return 0;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        return giaTri === "1"
            ? 1
            : 0;
    }

    async getThucDonBatBuocDuSoNgay() {
        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.THUC_DON_BAT_BUOC_DU_SO_NGAY
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return false;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        )
            .trim()
            .toLowerCase();

        return giaTri === "true";
    }

    async getSoTuanHienThiThucDon() {
        const MAC_DINH = 5;

        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.SO_TUAN_HIEN_THI_THUC_DON
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return MAC_DINH;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soTuan = Number(giaTri);

        if (
            !Number.isInteger(soTuan) ||
            soTuan <= 0
        ) {
            return MAC_DINH;
        }

        return soTuan;
    }

    async getSoNamHienThiThucDonThang() {
        const MAC_DINH = 5;

        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.SO_NAM_HIEN_THI_THUC_DON_THANG
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return MAC_DINH;
        }

        const giaTri = String(
            thietLap.gia_tri ??
            ""
        ).trim();

        if (!/^\d+$/.test(giaTri)) {
            return MAC_DINH;
        }

        const soNam = Number(giaTri);

        if (
            !Number.isInteger(soNam) ||
            soNam <= 0
        ) {
            return MAC_DINH;
        }

        return soNam;
    }

    async getQuyTacChonDonViQuyDoi() {

        const MAC_DINH = 4;

        const thietLap = await cauHinhRepository.getThietLapByMa(
            MA_THIET_LAP.QUY_TAC_CHON_DON_VI_QUY_DOI
        );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return MAC_DINH;
        }

        const giaTri = Number(
            String(
                thietLap.gia_tri ??
                ""
            ).trim()
        );

        if (!Number.isInteger(giaTri) || ![1, 2, 3, 4].includes( giaTri)
        ) {
            return MAC_DINH;
        }

        return giaTri;

    }

    async getQuyTacLamTron() {

        const MAC_DINH =
            0;


        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP
                        .QUY_TAC_LAM_TRON
                );


        if (
            !thietLap ||
            thietLap.active !== true
        ) {

            return MAC_DINH;

        }


        const giaTri =
            Number(
                String(
                    thietLap.gia_tri ??
                    ""
                ).trim()
            );


        if (
            !Number.isInteger(
                giaTri
            ) ||
            ![
                0,
                1,
                2
            ].includes(
                giaTri
            )
        ) {

            return MAC_DINH;

        }


        return giaTri;

    }

    async getSoChuSoSauDauPhay() {

        const MAC_DINH =
            2;


        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP
                        .SO_CHU_SO_SAU_DAU_PHAY
                );


        if (
            !thietLap ||
            thietLap.active !== true
        ) {

            return MAC_DINH;

        }


        const giaTri =
            Number(
                String(
                    thietLap.gia_tri ??
                    ""
                ).trim()
            );


        if (
            !Number.isInteger(
                giaTri
            ) ||
            giaTri < 0 ||
            giaTri > 5
        ) {

            return MAC_DINH;

        }


        return giaTri;

    }

    async getBatBuocChonNhomMon() {
        const MAC_DINH = true;

        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP.BAT_BUOC_CHON_NHOM_MON
                );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {
            return MAC_DINH;
        }

        const giaTri =
            String(
                thietLap.gia_tri ??
                ""
            )
                .trim()
                .toLowerCase();

        if (
            giaTri !== "true" &&
            giaTri !== "false"
        ) {
            return MAC_DINH;
        }

        return (
            giaTri ===
            "true"
        );
    }

    async getThuTuDoiTuongLayVe() {

        const MAC_DINH =
            1;


        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP
                        .THU_TU_DOI_TUONG_LAY_VE
                );


        if (
            !thietLap ||
            thietLap.active !== true
        ) {

            return MAC_DINH;

        }


        const giaTri =
            Number(
                String(
                    thietLap.gia_tri ??
                    ""
                ).trim()
            );


        if (
            !Number.isInteger(
                giaTri
            ) ||
            ![
                1,
                2,
                3,
                4,
                5,
                6
            ].includes(
                giaTri
            )
        ) {

            return MAC_DINH;

        }


        return giaTri;

    }

    async getPhuongThucThanhToanHienThi() {

        const MAC_DINH =
            [
                10,
                20,
                30
            ];


        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP
                        .PHUONG_THUC_THANH_TOAN_HIEN_THI
                );


        if (
            !thietLap ||
            thietLap.active !== true
        ) {

            return MAC_DINH;

        }


        const giaTri =
            String(
                thietLap.gia_tri ??
                ""
            )
                .split(
                    ","
                )
                .map(
                    item =>
                        Number(
                            item.trim()
                        )
                )
                .filter(
                    item =>
                        [
                            10,
                            20,
                            30
                        ].includes(
                            item
                        )
                );


        const danhSach =
            [
                ...new Set(
                    giaTri
                )
            ];


        if (
            danhSach.length ===
            0
        ) {

            return MAC_DINH;

        }


        return danhSach;

    }

    chuanHoaTienToMaVeAn(
        value
    ) {
        return String(
            value ??
            ""
        )
            .normalize(
                "NFD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /đ/g,
                "d"
            )
            .replace(
                /Đ/g,
                "D"
            )
            .toUpperCase()
            .replace(
                /[^A-Z0-9]/g,
                ""
            );
    }

    parseDinhDangMaVeAn(
        value
    ) {
        const text =
            String(
                value ??
                ""
            ).trim();

        if (
            !text
        ) {
            return null;
        }

        const tokens =
            text.match(
                /\[[^\[\]]+\]/g
            );

        if (
            !tokens ||
            tokens.join(
                ""
            ) !==
                text
        ) {
            return null;
        }

        let index =
            0;

        let tienTo =
            "";

        /*
        * ============================
        * [X] - KHÔNG BẮT BUỘC
        * ============================
        *
        * Nếu token đầu tiên không phải
        * [yy] thì hiểu là tiền tố [X].
        *
        * Nhưng không cho phép các token
        * hệ thống mm/dd/dayso đứng ở đây.
        */
        const firstToken =
            String(
                tokens[
                    index
                ] ||
                ""
            ).toLowerCase();

        if (
            firstToken !==
            "[yy]"
        ) {
            if (
                firstToken ===
                    "[mm]" ||
                firstToken ===
                    "[dd]" ||
                firstToken.startsWith(
                    "[dayso:"
                )
            ) {
                return null;
            }

            const rawPrefix =
                String(
                    tokens[
                        index
                    ] ||
                    ""
                ).slice(
                    1,
                    -1
                );

            tienTo =
                this.chuanHoaTienToMaVeAn(
                    rawPrefix
                );

            if (
                !tienTo
            ) {
                return null;
            }

            index +=
                1;
        }

        /*
        * ============================
        * [yy] - BẮT BUỘC
        * ============================
        */
        if (
            String(
                tokens[
                    index
                ] ||
                ""
            ).toLowerCase() !==
            "[yy]"
        ) {
            return null;
        }

        const coYY =
            true;

        index +=
            1;

        /*
        * ============================
        * [mm] - KHÔNG BẮT BUỘC
        * nhưng chỉ được sau [yy]
        * ============================
        */
        let coMM =
            false;

        if (
            String(
                tokens[
                    index
                ] ||
                ""
            ).toLowerCase() ===
            "[mm]"
        ) {
            coMM =
                true;

            index +=
                1;
        }

        /*
        * ============================
        * [dd] - KHÔNG BẮT BUỘC
        * nhưng bắt buộc phải có [mm]
        * ============================
        */
        let coDD =
            false;

        if (
            String(
                tokens[
                    index
                ] ||
                ""
            ).toLowerCase() ===
            "[dd]"
        ) {
            if (
                !coMM
            ) {
                return null;
            }

            coDD =
                true;

            index +=
                1;
        }

        /*
        * ============================
        * [dayso:n] - KHÔNG BẮT BUỘC
        *
        * Nếu không truyền:
        * mặc định n = 5
        * ============================
        */
        let doRongDaySo =
            5;

        if (
            index <
            tokens.length
        ) {
            const daySoMatch =
                String(
                    tokens[
                        index
                    ]
                ).match(
                    /^\[dayso:(\d+)\]$/i
                );

            if (
                !daySoMatch
            ) {
                return null;
            }

            const doRong =
                Number(
                    daySoMatch[
                        1
                    ]
                );

            if (
                !Number.isInteger(
                    doRong
                ) ||
                doRong <=
                    0
            ) {
                return null;
            }

            doRongDaySo =
                doRong;

            index +=
                1;
        }

        /*
        * Sau dayso không được còn
        * token nào khác.
        */
        if (
            index !==
            tokens.length
        ) {
            return null;
        }

        /*
        * Chuẩn hóa lại format.
        *
        * Ví dụ:
        *
        * [á1][yy][mm]
        *
        * ->
        *
        * [A1][yy][mm][dayso:5]
        */
        const parts =
            [];

        if (
            tienTo
        ) {
            parts.push(
                `[${tienTo}]`
            );
        }

        parts.push(
            "[yy]"
        );

        if (
            coMM
        ) {
            parts.push(
                "[mm]"
            );
        }

        if (
            coDD
        ) {
            parts.push(
                "[dd]"
            );
        }

        parts.push(
            `[dayso:${doRongDaySo}]`
        );

        return {
            dinhDang:
                parts.join(
                    ""
                ),

            tienTo,

            coYY,

            coMM,

            coDD,

            doRongDaySo,

            resetTheo:
                coDD
                    ? "day"
                    : coMM
                        ? "month"
                        : "year"
        };
    }

    async getQuyTacSinhMaVeAn() {
        const MAC_DINH =
            "[VA][yy][mm][dd][dayso:5]";

        const cauHinhMacDinh =
            this.parseDinhDangMaVeAn(
                MAC_DINH
            );

        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP
                        .DINH_DANG_MA_VE_AN
                );

        if (
            !thietLap ||
            thietLap.active !==
                true
        ) {
            return cauHinhMacDinh;
        }

        return (
            this.parseDinhDangMaVeAn(
                thietLap.gia_tri
            ) ||
            cauHinhMacDinh
        );
    }

    async getDinhDangMaVeAn() {
        const cauHinh =
            await this
                .getQuyTacSinhMaVeAn();

        return cauHinh
            .dinhDang;
    }

    async getSoPhutDatHangTruoc() {

        const MAC_DINH =
            20;

        const thietLap =
            await cauHinhRepository
                .getThietLapByMa(
                    MA_THIET_LAP
                        .SO_PHUT_DAT_HANG_TRUOC
                );

        if (
            !thietLap ||
            thietLap.active !== true
        ) {

            return MAC_DINH;

        }

        const giaTri =
            String(
                thietLap.gia_tri ??
                ""
            ).trim();

        if (
            !/^\d+$/.test(
                giaTri
            )
        ) {

            return MAC_DINH;

        }

        const soPhut =
            Number(giaTri);

        if (
            !Number.isInteger(
                soPhut
            ) ||
            soPhut < 0 ||
            soPhut > 1440
        ) {

            return MAC_DINH;

        }

        return soPhut;

    }
}

module.exports = new CauHinhService();