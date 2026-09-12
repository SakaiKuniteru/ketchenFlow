const ApiError = require('../../../../utils/api-error');
const thietLapRepository = require('./thiet-lap.repository');
const cauHinhService = require('../../../cau-hinh/cau-hinh.service');

class ThietLapService {
    parseId(id) {
        const thietLapId = Number(id);

        if (!Number.isInteger(thietLapId) || thietLapId <= 0) {
            throw new ApiError(400, 'ID thiết lập không hợp lệ.');
        }

        return thietLapId;
    }

    chuanHoaThoiGian(
        value,
        laDenNgay = false
    ) {
        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ''
        ) {
            return null;
        }

        const text =
            String(value).trim();

        if (
            /^\d{4}-\d{2}-\d{2}$/
                .test(text)
        ) {
            return `${text} ${
                laDenNgay
                    ? '23:59:59'
                    : '00:00:00'
            }`;
        }

        if (
            /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/
                .test(text)
        ) {
            return text.replace(
                'T',
                ' '
            );
        }

        throw new ApiError(
            400,
            'Thời gian phải có định dạng yyyy-MM-dd hoặc yyyy-MM-dd HH:mm:ss.'
        );
    }

    chuanHoaKhoangThoiGian(
        tuNgay,
        denNgay
    ) {
        const tu =
            this.chuanHoaThoiGian(
                tuNgay,
                false
            );

        const den =
            this.chuanHoaThoiGian(
                denNgay,
                true
            );

        if (
            tu &&
            den &&
            new Date(tu).getTime() >
                new Date(den).getTime()
        ) {
            throw new ApiError(
                400,
                'Từ ngày phải nhỏ hơn hoặc bằng đến ngày.'
            );
        }

        return {
            tuNgay: tu,
            denNgay: den
        };
    }

    validateKhoangGiaTri(
        dsGiaTri
    ) {
        if (
            !Array.isArray(
                dsGiaTri
            ) ||
            dsGiaTri.length <= 1
        ) {
            return;
        }

        const danhSach =
            dsGiaTri
                .filter(
                    item =>
                        item.active !==
                        false
                )
                .map(
                    item => ({
                        ...item,

                        tuNgay:
                            item.tuNgay ||
                            null,

                        denNgay:
                            item.denNgay ||
                            null
                    })
                )
                .sort(
                    (a, b) => {
                        if (
                            !a.tuNgay &&
                            !b.tuNgay
                        ) {
                            return 0;
                        }

                        if (!a.tuNgay) {
                            return -1;
                        }

                        if (!b.tuNgay) {
                            return 1;
                        }

                        return String(
                            a.tuNgay
                        ).localeCompare(
                            String(
                                b.tuNgay
                            )
                        );
                    }
                );


        for (
            let index = 0;
            index <
            danhSach.length - 1;
            index += 1
        ) {
            const hienTai =
                danhSach[index];

            const tiepTheo =
                danhSach[index + 1];


            if (!tiepTheo.tuNgay) {
                continue;
            }


            if (!hienTai.denNgay) {
                throw new ApiError(
                    400,
                    `Khoảng thời gian của giá trị "${hienTai.giaTri}" bị chồng với giá trị "${tiepTheo.giaTri}".`
                );
            }


            if (
                String(
                    hienTai.denNgay
                ) >=
                String(
                    tiepTheo.tuNgay
                )
            ) {
                throw new ApiError(
                    400,
                    `Khoảng thời gian của giá trị "${hienTai.giaTri}" bị chồng với giá trị "${tiepTheo.giaTri}".`
                );
            }
        }
    }

    async getTongHop(query) {
        return await thietLapRepository.getTongHop(query);
    }

    async getChiTiet(id) {
        const thietLapId =
            this.parseId(id);

        const thietLap =
            await thietLapRepository
                .getChiTiet(
                    thietLapId
                );

        if (!thietLap) {
            throw new ApiError(
                404,
                'Thiết lập không tồn tại.'
            );
        }

        return {
            ...thietLap,

            cauHinh:
                cauHinhService
                    .getCauHinhThietLap(
                        thietLap.maThietLap
                    )
        };
    }

    getCauHinhTheoMa(maThietLap) {
        const ma =
            String(
                maThietLap ||
                ''
            )
                .trim()
                .toUpperCase();

        if (!ma) {
            throw new ApiError(
                400,
                'Mã thiết lập không hợp lệ.'
            );
        }

        return cauHinhService
            .getCauHinhThietLap(
                ma
            );
    }

    async getGiaTriTheoMa(maThietLap) {
        if (typeof maThietLap !== 'string' || !maThietLap.trim()) {
            throw new ApiError(400, 'Mã thiết lập không hợp lệ.');
        }

        const giaTri = await thietLapRepository.getGiaTriTheoMa(maThietLap.trim().toUpperCase());

        if (giaTri === null) {
            throw new ApiError(404, 'Thiết lập không tồn tại hoặc đã bị khóa.');
        }

        return giaTri;
    }

    async getGiaTriTheoId(maThietLap) {
        if (typeof maThietLap !== 'string' || !maThietLap.trim()) {
            throw new ApiError(400, 'Mã thiết lập không hợp lệ.');
        }

        const thietLap = await thietLapRepository.getGiaTriTheoId(maThietLap.trim().toUpperCase());

        if (!thietLap) {
            throw new ApiError(404, 'Thiết lập không tồn tại hoặc đã bị khóa.');
        }

        return thietLap;
    }

    async getByGroup(nhom) {
        if (typeof nhom !== 'string' || !nhom.trim()) {
            throw new ApiError(400, 'Mã nhóm tính năng không hợp lệ.');
        }

        return await thietLapRepository.getByGroup(nhom.trim().toUpperCase());
    }

    async chuanHoaLienKet(data) {
        const duLieu = {
            ...data
        };

        if (Array.isArray(duLieu.dsMaCoSo)) {
            const danhSachMa = [
                ...new Set(
                    duLieu.dsMaCoSo
                        .map(
                            (ma) =>
                                String(ma)
                                    .trim()
                                    .toUpperCase()
                        )
                        .filter(Boolean)
                )
            ];

            if (danhSachMa.length === 0) {
                duLieu.dsCoSoId = [];
                delete duLieu.dsMaCoSo;
            } else {
                const danhSachCoSo =
                    await thietLapRepository
                        .getDsCoSoByMas(
                            danhSachMa
                        );

                if (
                    danhSachCoSo.length !==
                    danhSachMa.length
                ) {
                    const maTimThay =
                        danhSachCoSo.map(
                            (item) =>
                                item.maCoSo
                                    .trim()
                                    .toUpperCase()
                        );

                    const maKhongTonTai =
                        danhSachMa.filter(
                            (ma) =>
                                !maTimThay.includes(ma)
                        );

                    throw new ApiError(
                        400,
                        `Mã cơ sở không tồn tại: ${maKhongTonTai.join(', ')}.`
                    );
                }

                const coSoBiKhoa =
                    danhSachCoSo.find(
                        (item) =>
                            !item.active
                    );

                if (coSoBiKhoa) {
                    throw new ApiError(
                        400,
                        `Cơ sở "${coSoBiKhoa.tenCoSo}" đã bị khóa.`
                    );
                }

                const idsTheoMa =
                    danhSachMa.map(
                        (ma) => {
                            const coSo =
                                danhSachCoSo.find(
                                    (item) =>
                                        item.maCoSo
                                            .trim()
                                            .toUpperCase() === ma
                                );

                            return Number(
                                coSo.id
                            );
                        }
                    );

                if (
                    Array.isArray(
                        duLieu.dsCoSoId
                    )
                ) {
                    const idsDaTruyen = [
                        ...new Set(
                            duLieu.dsCoSoId.map(
                                (id) =>
                                    Number(id)
                            )
                        )
                    ];

                    const a =
                        [...idsTheoMa]
                            .sort(
                                (x, y) =>
                                    x - y
                            );

                    const b =
                        [...idsDaTruyen]
                            .sort(
                                (x, y) =>
                                    x - y
                            );

                    if (
                        JSON.stringify(a) !==
                        JSON.stringify(b)
                    ) {
                        throw new ApiError(
                            400,
                            'Danh sách ID và mã cơ sở không khớp.'
                        );
                    }
                }

                duLieu.dsCoSoId =
                    idsTheoMa;

                delete duLieu.dsMaCoSo;
            }
        } else if (
            Array.isArray(
                duLieu.dsCoSoId
            )
        ) {
            duLieu.dsCoSoId = [
                ...new Set(
                    duLieu.dsCoSoId.map(
                        (id) =>
                            Number(id)
                    )
                )
            ];
        }

        delete duLieu.dsMaCoSo;

        if (Array.isArray(duLieu.dsMaNhomTinhNang)) {
            const danhSachMa = [
                ...new Set(duLieu.dsMaNhomTinhNang.map((ma) => String(ma).trim().toUpperCase()).filter(Boolean))
            ];

            if (danhSachMa.length === 0) {
                throw new ApiError(400, 'Danh sách mã nhóm tính năng không được để trống.');
            }

            const danhSachNhom = await thietLapRepository.getDsNhomTinhNangByMas(danhSachMa);

            if (danhSachNhom.length !== danhSachMa.length) {
                const maTimThay = danhSachNhom.map((item) => item.maNhomTinhNang.toUpperCase());

                const maKhongTonTai = danhSachMa.filter((ma) => !maTimThay.includes(ma));

                throw new ApiError(400, `Mã nhóm tính năng không tồn tại: ${maKhongTonTai.join(', ')}.`);
            }

            const nhomBiKhoa = danhSachNhom.find((item) => !item.active);

            if (nhomBiKhoa) {
                throw new ApiError(400, `Nhóm tính năng "${nhomBiKhoa.tenNhomTinhNang}" đã bị khóa.`);
            }

            const idsTheoMa = danhSachMa.map((ma) => {
                const nhomTinhNang = danhSachNhom.find((item) => item.maNhomTinhNang.toUpperCase() === ma);

                return Number(nhomTinhNang.id);
            });

            if (Array.isArray(duLieu.dsNhomTinhNangId)) {
                const idsDaTruyen = [...new Set(duLieu.dsNhomTinhNangId.map((id) => Number(id)))];

                const idsTheoMaSapXep = [...idsTheoMa].sort((a, b) => a - b);

                const idsDaTruyenSapXep = [...idsDaTruyen].sort((a, b) => a - b);

                if (JSON.stringify(idsTheoMaSapXep) !== JSON.stringify(idsDaTruyenSapXep)) {
                    throw new ApiError(400, 'Danh sách ID và mã nhóm tính năng không khớp.');
                }
            }

            duLieu.dsNhomTinhNangId = idsTheoMa;
        } else if (Array.isArray(duLieu.dsNhomTinhNangId)) {
            duLieu.dsNhomTinhNangId = [...new Set(duLieu.dsNhomTinhNangId.map((id) => Number(id)))];
        }

        delete duLieu.dsMaNhomTinhNang;

        return duLieu;
    }

    async validateLienKet(data) {
        if (!Array.isArray(data.dsNhomTinhNangId) || data.dsNhomTinhNangId.length === 0) {
            throw new ApiError(400, 'Phải chọn ít nhất một nhóm tính năng.');
        }

        const danhSachId = [...new Set(data.dsNhomTinhNangId.map((id) => Number(id)))];

        const idKhongHopLe = danhSachId.some((id) => !Number.isInteger(id) || id <= 0);

        if (idKhongHopLe) {
            throw new ApiError(400, 'Danh sách nhóm tính năng không hợp lệ.');
        }

        const danhSachNhom = await thietLapRepository.getDsNhomTinhNangByIds(danhSachId);

        if (danhSachNhom.length !== danhSachId.length) {
            const idsTimThay = danhSachNhom.map((item) => Number(item.id));

            const idsKhongTonTai = danhSachId.filter((id) => !idsTimThay.includes(id));

            throw new ApiError(400, `Nhóm tính năng không tồn tại: ${idsKhongTonTai.join(', ')}.`);
        }

        const nhomBiKhoa = danhSachNhom.find((item) => !item.active);

        if (nhomBiKhoa) {
            throw new ApiError(400, `Nhóm tính năng "${nhomBiKhoa.tenNhomTinhNang}" đã bị khóa.`);
        }

        data.dsNhomTinhNangId = danhSachId;
    }

    async validateCoSo(
        maThietLap,
        dsCoSoId
    ) {
        const cauHinh =
            cauHinhService
                .getCauHinhThietLap(
                    maThietLap
                );

        const danhSachId =
            Array.isArray(dsCoSoId)
                ? [
                    ...new Set(
                        dsCoSoId.map(
                            (id) =>
                                Number(id)
                        )
                    )
                ]
                : [];

        if (
            cauHinh.quyTacCoSo ===
            'KHONG_CHO_CHON'
        ) {
            if (
                danhSachId.length > 0
            ) {
                throw new ApiError(
                    400,
                    'Thiết lập này không được thiết lập cơ sở.'
                );
            }

            return [];
        }

        if (
            cauHinh.quyTacCoSo ===
                'BAT_BUOC' &&
            danhSachId.length === 0
        ) {
            throw new ApiError(
                400,
                'Thiết lập này bắt buộc phải có cơ sở.'
            );
        }

        if (
            danhSachId.length === 0
        ) {
            return [];
        }

        const coIdKhongHopLe =
            danhSachId.some(
                (id) =>
                    !Number.isInteger(id) ||
                    id <= 0
            );

        if (coIdKhongHopLe) {
            throw new ApiError(
                400,
                'Danh sách cơ sở không hợp lệ.'
            );
        }

        const danhSachCoSo =
            await thietLapRepository
                .getDsCoSoByIds(
                    danhSachId
                );

        if (
            danhSachCoSo.length !==
            danhSachId.length
        ) {
            const idsTimThay =
                danhSachCoSo.map(
                    (item) =>
                        Number(item.id)
                );

            const idsKhongTonTai =
                danhSachId.filter(
                    (id) =>
                        !idsTimThay.includes(id)
                );

            throw new ApiError(
                400,
                `Cơ sở không tồn tại: ${idsKhongTonTai.join(', ')}.`
            );
        }

        const coSoBiKhoa =
            danhSachCoSo.find(
                (item) =>
                    !item.active
            );

        if (coSoBiKhoa) {
            throw new ApiError(
                400,
                `Cơ sở "${coSoBiKhoa.tenCoSo}" đã bị khóa.`
            );
        }

        return danhSachId;
    }

    async validateTrungDuLieu(data, excludeId = null) {
        const trungMa = await thietLapRepository.existsMaThietLap(data.maThietLap, excludeId);

        if (trungMa) {
            throw new ApiError(409, 'Mã thiết lập đã tồn tại.');
        }

        const trungTen = await thietLapRepository.existsTenThietLap(data.tenThietLap, excludeId);

        if (trungTen) {
            throw new ApiError(409, 'Tên thiết lập đã tồn tại trong cơ sở này.');
        }
    }

    async create(data) {
        const duLieuTao = {
            ...data,

            maThietLap:
                String(
                    data.maThietLap || ''
                )
                    .trim()
                    .toUpperCase(),

            tenThietLap:
                String(
                    data.tenThietLap || ''
                ).trim(),

            moTa:
                data.moTa !== undefined &&
                data.moTa !== null
                    ? String(
                        data.moTa
                    ).trim() || null
                    : null,

            active:
                data.active !== false,

            dsGiaTri:
                Array.isArray(
                    data.dsGiaTri
                )
                    ? data.dsGiaTri
                    : []
        };

        const duLieuDaChuanHoa =
            await this.chuanHoaLienKet(
                duLieuTao
            );

        duLieuDaChuanHoa.dsCoSoId =
            await this.validateCoSo(
                duLieuDaChuanHoa.maThietLap,
                duLieuDaChuanHoa.dsCoSoId
            );

        await this.validateLienKet(
            duLieuDaChuanHoa
        );

        await this.validateTrungDuLieu(
            duLieuDaChuanHoa
        );

        duLieuDaChuanHoa.dsGiaTri =
            duLieuDaChuanHoa.dsGiaTri
                .map((item) => {
                    const range =
                        this.chuanHoaKhoangThoiGian(
                            item.tuNgay,
                            item.denNgay
                        );

                    return {
                        id:
                            item.id,

                        giaTri:
                            item.giaTri === null
                                ? null
                                : String(
                                    item.giaTri
                                ),

                        tuNgay:
                            range.tuNgay,

                        denNgay:
                            range.denNgay,

                        active:
                            item.active !== false
                    };
                });

        this.validateKhoangGiaTri(
            duLieuDaChuanHoa.dsGiaTri
        );

        return await thietLapRepository
            .create(
                duLieuDaChuanHoa
            );
    }

    async update(id, data) {
        const thietLapId =
            this.parseId(id);

        const thietLap =
            await thietLapRepository
                .getChiTiet(
                    thietLapId
                );

        if (!thietLap) {
            throw new ApiError(
                404,
                'Thiết lập không tồn tại.'
            );
        }

        const dsGiaTriNguon =
            data.dsGiaTri !== undefined
                ? data.dsGiaTri
                : thietLap.dsGiaTri;

        const idsGiaTriHienTai =
            new Set(
                thietLap.dsGiaTri.map(
                    (item) =>
                        Number(item.id)
                )
            );

        for (
            const item of dsGiaTriNguon
        ) {
            if (
                item.id !== undefined &&
                item.id !== null &&
                !idsGiaTriHienTai.has(
                    Number(item.id)
                )
            ) {
                throw new ApiError(
                    400,
                    `Giá trị thiết lập ID ${item.id} không thuộc thiết lập này.`
                );
            }
        }

        const duLieuCapNhat = {
            maThietLap:
                data.maThietLap !== undefined
                    ? String(
                        data.maThietLap
                    )
                        .trim()
                        .toUpperCase()
                    : thietLap.maThietLap,

            tenThietLap:
                data.tenThietLap !== undefined
                    ? String(
                        data.tenThietLap
                    ).trim()
                    : thietLap.tenThietLap,

            moTa:
                data.moTa !== undefined
                    ? data.moTa === null
                        ? null
                        : String(
                            data.moTa
                        ).trim() || null
                    : thietLap.moTa,

            dsCoSoId:
                data.dsCoSoId !== undefined
                    ? data.dsCoSoId
                    : data.dsMaCoSo !== undefined
                        ? undefined
                        : thietLap.dsCoSoId,

            dsMaCoSo:
                data.dsMaCoSo !== undefined
                    ? data.dsMaCoSo
                    : undefined,

            dsNhomTinhNangId:
                data.dsNhomTinhNangId !== undefined
                    ? data.dsNhomTinhNangId
                    : data.dsMaNhomTinhNang !== undefined
                        ? undefined
                        : thietLap.dsNhomTinhNangId,

            dsMaNhomTinhNang:
                data.dsMaNhomTinhNang !== undefined
                    ? data.dsMaNhomTinhNang
                    : undefined,

            dsGiaTri:
                dsGiaTriNguon.map(
                    (item) => {
                        const range =
                            this.chuanHoaKhoangThoiGian(
                                item.tuNgay,
                                item.denNgay
                            );

                        return {
                            id:
                                item.id,

                            giaTri:
                                item.giaTri === null
                                    ? null
                                    : String(
                                        item.giaTri
                                    ),

                            tuNgay:
                                range.tuNgay,

                            denNgay:
                                range.denNgay,

                            active:
                                item.active !== false
                        };
                    }
                ),

            active:
                data.active !== undefined
                    ? data.active
                    : thietLap.active
        };

        const duLieuDaChuanHoa =
            await this.chuanHoaLienKet(
                duLieuCapNhat
            );

        duLieuDaChuanHoa.dsCoSoId =
            await this.validateCoSo(
                duLieuDaChuanHoa.maThietLap,
                duLieuDaChuanHoa.dsCoSoId
            );

        await this.validateLienKet(
            duLieuDaChuanHoa
        );

        await this.validateTrungDuLieu(
            duLieuDaChuanHoa,
            thietLapId
        );

        this.validateKhoangGiaTri(
            duLieuDaChuanHoa.dsGiaTri
        );

        const ketQua =
            await thietLapRepository
                .update(
                    thietLapId,
                    duLieuDaChuanHoa
                );

        if (!ketQua) {
            throw new ApiError(
                404,
                'Thiết lập không tồn tại.'
            );
        }

        return ketQua;
    }

    async dongBo(id) {
        const thietLap =
            await this.getChiTiet(
                id
            );

        return await cauHinhService
            .dongBoThietLap(
                thietLap.maThietLap,
                {
                    thietLap
                }
            );
    }

    async dongBoTatCa() {
        const danhSach =
            await thietLapRepository
                .getTongHop();


        const ketQua =
            [];

        let thanhCong =
            0;

        let thatBai =
            0;


        for (
            const thietLap of danhSach
        ) {

            try {

                const result =
                    await cauHinhService
                        .dongBoThietLap(
                            thietLap.maThietLap,
                            {
                                thietLap
                            }
                        );


                ketQua.push({
                    id:
                        thietLap.id,

                    maThietLap:
                        thietLap.maThietLap,

                    success:
                        true,

                    ...result
                });


                thanhCong +=
                    1;

            } catch (
                error
            ) {

                ketQua.push({
                    id:
                        thietLap.id,

                    maThietLap:
                        thietLap.maThietLap,

                    success:
                        false,

                    message:
                        error?.message ||
                        'Cập nhật thiết lập thất bại.'
                });


                thatBai +=
                    1;

            }

        }


        return {
            tongSo:
                danhSach.length,

            thanhCong,

            thatBai,

            ketQua
        };
    }
}

module.exports = new ThietLapService();
