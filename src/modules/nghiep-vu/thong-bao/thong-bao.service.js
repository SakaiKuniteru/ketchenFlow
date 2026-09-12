const pool = require('../../../config/database');

const ApiError = require('../../../utils/api-error');

const {
    loaiDoiTuong: danhSachLoaiDoiTuong,
    trangThaiThongBao: danhSachTrangThaiThongBao
} = require('../../../constants/enums');

const thongBaoRepository = require('./thong-bao.repository');

class ThongBaoService {
    getThongTinTrangThaiThongBao(giaTriTrangThai) {
        const giaTriSo = Number(giaTriTrangThai);

        const trangThai = danhSachTrangThaiThongBao.find((item) => Number(item.value) === giaTriSo);

        if (!trangThai) {
            return {
                value: giaTriSo,
                name: 'Không xác định'
            };
        }

        return {
            value: Number(trangThai.value),
            name: trangThai.name
        };
    }

    getThongTinLoaiDoiTuong(giaTriLoaiDoiTuong) {
        const giaTriSo = Number(giaTriLoaiDoiTuong);

        const loaiDoiTuong = danhSachLoaiDoiTuong.find((item) => Number(item.value) === giaTriSo);

        if (!loaiDoiTuong) {
            return {
                value: giaTriSo,
                name: 'Không xác định'
            };
        }

        return {
            value: Number(loaiDoiTuong.value),
            name: loaiDoiTuong.name
        };
    }

    mapThongBaoResponse(thongBao) {
        if (!thongBao) {
            return null;
        }

        return {
            ...thongBao,

            trangThai: this.getThongTinTrangThaiThongBao(thongBao.trangThai),

            doiTuong: Array.isArray(thongBao.doiTuong)
                ? thongBao.doiTuong.map((item) => ({
                      ...item,

                      loaiDoiTuong: this.getThongTinLoaiDoiTuong(item.loaiDoiTuong)
                  }))
                : thongBao.doiTuong
        };
    }
    parseId(id) {
        const giaTri = Number(id);

        if (!Number.isInteger(giaTri) || giaTri <= 0) {
            throw new ApiError(400, 'ID thông báo không hợp lệ.');
        }

        return giaTri;
    }

    parseTaiKhoanId(taiKhoanId) {
        const giaTri = Number(taiKhoanId);

        if (!Number.isInteger(giaTri) || giaTri <= 0) {
            throw new ApiError(401, 'Không xác định được tài khoản đăng nhập.');
        }

        return giaTri;
    }

    validateLoaiDoiTuong(value) {
        const giaTri = Number(value);

        const hopLe = danhSachLoaiDoiTuong.some((item) => Number(item.value) === giaTri);

        if (!hopLe) {
            throw new ApiError(400, 'Loại đối tượng nhận thông báo không hợp lệ.');
        }

        return giaTri;
    }

    validateTrangThaiThongBao(giaTriTrangThai) {
        const giaTriSo = Number(giaTriTrangThai);

        const hopLe = danhSachTrangThaiThongBao.some((item) => Number(item.value) === giaTriSo);

        if (!hopLe) {
            throw new ApiError(400, 'Trạng thái thông báo không hợp lệ.');
        }

        return giaTriSo;
    }

    chuanHoaDoiTuong(doiTuong = []) {
        if (!Array.isArray(doiTuong)) {
            throw new ApiError(400, 'Danh sách đối tượng nhận không hợp lệ.');
        }

        const map = new Map();

        doiTuong.forEach((item) => {
            const loaiDoiTuong = this.validateLoaiDoiTuong(item.loaiDoiTuong);

            const doiTuongId = Number(item.doiTuongId);

            if (!Number.isInteger(doiTuongId) || doiTuongId <= 0) {
                throw new ApiError(400, 'ID đối tượng nhận không hợp lệ.');
            }

            const key = `${loaiDoiTuong}:${doiTuongId}`;

            map.set(key, {
                loaiDoiTuong,
                doiTuongId
            });
        });

        return [...map.values()];
    }

    validatePhamVi(guiTatCa, doiTuong) {
        if (guiTatCa === true) {
            if (doiTuong.length > 0) {
                throw new ApiError(400, 'Thông báo gửi tất cả không được chọn thêm đối tượng nhận.');
            }

            return;
        }

        if (doiTuong.length === 0) {
            throw new ApiError(400, 'Vui lòng chọn ít nhất một đối tượng nhận thông báo.');
        }
    }

    validateQuyenCapNhat(thongBao, permissions) {
        const danhSachQuyen = permissions instanceof Set ? permissions : new Set(permissions || []);

        if (thongBao.tuDong === true) {
            if (!danhSachQuyen.has('Q001013')) {
                throw new ApiError(403, 'Bạn không có quyền cập nhật thông báo tự động.');
            }

            return;
        }

        const coQuyenCapNhat = danhSachQuyen.has('Q001012') || danhSachQuyen.has('Q001013');

        if (!coQuyenCapNhat) {
            throw new ApiError(403, 'Bạn không có quyền cập nhật thông báo.');
        }
    }

    async thuHoiDuongDanTheoThamChieu(loaiThamChieu, thamChieuId, maSuKien) {
        return await thongBaoRepository.thuHoiDuongDanTheoThamChieu(
            String(loaiThamChieu || '').trim(),

            Number(thamChieuId),

            String(maSuKien || '').trim()
        );
    }

    async validateDoiTuong(doiTuong, client = pool) {
        const nhomTheoLoai = new Map();

        doiTuong.forEach((item) => {
            const loai = Number(item.loaiDoiTuong);

            if (!nhomTheoLoai.has(loai)) {
                nhomTheoLoai.set(loai, []);
            }

            nhomTheoLoai.get(loai).push(Number(item.doiTuongId));
        });

        for (const [loai, ids] of nhomTheoLoai) {
            const hopLe = await thongBaoRepository.existsDoiTuongIds(loai, ids, client);

            if (!hopLe) {
                throw new ApiError(400, 'Một hoặc nhiều đối tượng nhận không tồn tại hoặc không còn hiệu lực.');
            }
        }
    }

    async resolveNguoiNhan(guiTatCa, doiTuong, client = pool) {
        if (guiTatCa === true) {
            return await thongBaoRepository.getTaiKhoanIdsTatCa(client);
        }

        const vaiTroIds = [];

        const chucVuIds = [];

        const taiKhoanIds = [];

        doiTuong.forEach((item) => {
            switch (Number(item.loaiDoiTuong)) {
                case 10:
                    vaiTroIds.push(Number(item.doiTuongId));

                    break;

                case 20:
                    chucVuIds.push(Number(item.doiTuongId));

                    break;

                case 30:
                    taiKhoanIds.push(Number(item.doiTuongId));

                    break;
            }
        });

        const [theoVaiTro, theoChucVu, trucTiep] = await Promise.all([
            thongBaoRepository.getTaiKhoanIdsTheoVaiTro(vaiTroIds, client),

            thongBaoRepository.getTaiKhoanIdsTheoChucVu(chucVuIds, client),

            thongBaoRepository.getTaiKhoanIdsTrucTiep(taiKhoanIds, client)
        ]);

        return [...new Set([...theoVaiTro, ...theoChucVu, ...trucTiep])];
    }

    async getTongHop(query = {}) {
        const filters = {};

        if (query.trangThai !== undefined && query.trangThai !== '') {
            filters.trangThai = this.validateTrangThaiThongBao(query.trangThai);
        }

        if (query.tuDong !== undefined && query.tuDong !== '') {
            filters.tuDong = String(query.tuDong).toLowerCase() === 'true';
        }

        if (query.guiTatCa !== undefined && query.guiTatCa !== '') {
            filters.guiTatCa = String(query.guiTatCa).toLowerCase() === 'true';
        }

        if (query.maSuKien) {
            filters.maSuKien = String(query.maSuKien).trim();
        }

        const danhSach = await thongBaoRepository.getTongHop(filters);

        return danhSach.map((item) => this.mapThongBaoResponse(item));
    }

    async getChiTiet(id) {
        const thongBaoId = this.parseId(id);

        const thongBao = await thongBaoRepository.getChiTiet(thongBaoId);

        if (!thongBao) {
            throw new ApiError(404, 'Thông báo không tồn tại.');
        }

        return this.mapThongBaoResponse(thongBao);
    }

    async getTongHopDoiTuong(query = {}) {
        const loaiDoiTuong = this.validateLoaiDoiTuong(query.loaiDoiTuong);

        const data = await thongBaoRepository.getTongHopDoiTuong(loaiDoiTuong);

        return {
            loaiDoiTuong: this.getThongTinLoaiDoiTuong(loaiDoiTuong),

            data
        };
    }

    async getCuaToi(taiKhoanId, query = {}) {
        const taiKhoanIdSo = this.parseTaiKhoanId(taiKhoanId);

        const filters = {};

        if (query.daDoc !== undefined && query.daDoc !== '') {
            const giaTri = String(query.daDoc).trim().toLowerCase();

            if (giaTri !== 'true' && giaTri !== 'false') {
                throw new ApiError(400, 'Trạng thái đã đọc phải là true hoặc false.');
            }

            filters.daDoc = giaTri === 'true';
        }

        return await thongBaoRepository.getCuaToi(taiKhoanIdSo, filters);
    }

    async getSoChuaDoc(taiKhoanId) {
        const taiKhoanIdSo = this.parseTaiKhoanId(taiKhoanId);

        return await thongBaoRepository.getSoChuaDoc(taiKhoanIdSo);
    }

    async danhDauDaDoc(id, taiKhoanId) {
        const thongBaoId = this.parseId(id);

        const taiKhoanIdSo = this.parseTaiKhoanId(taiKhoanId);

        const ketQua = await thongBaoRepository.danhDauDaDoc(thongBaoId, taiKhoanIdSo);

        if (!ketQua) {
            throw new ApiError(404, 'Thông báo không tồn tại hoặc không thuộc tài khoản của bạn.');
        }

        return ketQua;
    }

    async danhDauTatCaDaDoc(taiKhoanId) {
        const taiKhoanIdSo = this.parseTaiKhoanId(taiKhoanId);

        return await thongBaoRepository.danhDauTatCaDaDoc(taiKhoanIdSo);
    }

    async create(data, nguoiTaoId) {
        const doiTuong = this.chuanHoaDoiTuong(data.doiTuong || []);

        const guiTatCa = data.guiTatCa === true;

        this.validatePhamVi(guiTatCa, doiTuong);

        const duLieuTao = {
            tieuDe: data.tieuDe.trim(),

            noiDung: data.noiDung.trim(),

            guiTatCa,

            tuDong: false,

            maSuKien: 'THONG_BAO_THU_CONG',

            loaiThamChieu: data.loaiThamChieu?.trim() || null,

            thamChieuId: data.thamChieuId !== undefined && data.thamChieuId !== null ? Number(data.thamChieuId) : null,

            duongDan: data.duongDan?.trim() || null,

            trangThai: 10,

            nguoiTaoId: nguoiTaoId,

            thoiGianGui: null
        };

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            if (!guiTatCa) {
                await this.validateDoiTuong(doiTuong, client);
            }

            const thongBao = await thongBaoRepository.create(duLieuTao, client);

            await thongBaoRepository.saveDoiTuong(thongBao.id, doiTuong, client);

            await client.query('COMMIT');

            return await this.getChiTiet(thongBao.id);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async update(id, data, permissions) {
        const thongBaoId = this.parseId(id);

        const thongBao = await this.getChiTiet(thongBaoId);

        this.validateQuyenCapNhat(thongBao, permissions);

        const giaTriTrangThaiHienTai =
            typeof thongBao.trangThai === 'object' ? thongBao.trangThai.value : thongBao.trangThai;

        const trangThaiHienTai = Number(giaTriTrangThaiHienTai);

        if (![10, 30].includes(trangThaiHienTai)) {
            throw new ApiError(409, 'Chỉ được cập nhật thông báo ở trạng thái Tạo mới hoặc Đã huỷ.');
        }

        const guiTatCa = data.guiTatCa !== undefined ? data.guiTatCa === true : thongBao.guiTatCa;

        const doiTuong =
            data.doiTuong !== undefined
                ? this.chuanHoaDoiTuong(data.doiTuong)
                : guiTatCa
                  ? []
                  : this.chuanHoaDoiTuong(thongBao.doiTuong || []);

        this.validatePhamVi(guiTatCa, doiTuong);

        const duLieuCapNhat = {
            tieuDe: data.tieuDe !== undefined ? data.tieuDe.trim() : thongBao.tieuDe,

            noiDung: data.noiDung !== undefined ? data.noiDung.trim() : thongBao.noiDung,

            guiTatCa,

            loaiThamChieu:
                data.loaiThamChieu !== undefined ? data.loaiThamChieu?.trim() || null : thongBao.loaiThamChieu,

            thamChieuId:
                data.thamChieuId !== undefined
                    ? data.thamChieuId === null
                        ? null
                        : Number(data.thamChieuId)
                    : thongBao.thamChieuId,

            duongDan: data.duongDan !== undefined ? data.duongDan?.trim() || null : thongBao.duongDan
        };

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            if (!guiTatCa) {
                await this.validateDoiTuong(doiTuong, client);
            }

            const ketQua = await thongBaoRepository.update(thongBaoId, duLieuCapNhat, client);

            if (!ketQua) {
                throw new ApiError(404, 'Thông báo không tồn tại.');
            }

            await thongBaoRepository.saveDoiTuong(thongBaoId, doiTuong, client);

            await client.query('COMMIT');

            return await this.getChiTiet(thongBaoId);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async gui(id) {
        const thongBaoId = this.parseId(id);

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const thongBao = await thongBaoRepository.getByIdForUpdate(thongBaoId, client);

            if (!thongBao) {
                throw new ApiError(404, 'Thông báo không tồn tại.');
            }

            const trangThai = Number(thongBao.trang_thai);

            if (![10, 30].includes(trangThai)) {
                throw new ApiError(409, 'Chỉ được gửi thông báo ở trạng thái Tạo mới hoặc Đã huỷ.');
            }

            const doiTuong = await thongBaoRepository.getDoiTuong(thongBaoId, client);

            const nguoiNhanIds = await this.resolveNguoiNhan(thongBao.gui_tat_ca, doiTuong, client);

            if (nguoiNhanIds.length === 0) {
                throw new ApiError(400, 'Không xác định được tài khoản nhận thông báo.');
            }

            await thongBaoRepository.saveNguoiNhan(thongBaoId, nguoiNhanIds, client);

            await thongBaoRepository.danhDauDaGui(thongBao.id, client);

            await client.query('COMMIT');

            return await this.getChiTiet(thongBaoId);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async huyGui(id) {
        const thongBaoId = this.parseId(id);

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const thongBao = await thongBaoRepository.getByIdForUpdate(thongBaoId, client);

            if (!thongBao) {
                throw new ApiError(404, 'Thông báo không tồn tại.');
            }

            if (Number(thongBao.trang_thai) !== 20) {
                throw new ApiError(409, 'Chỉ được huỷ gửi thông báo ở trạng thái Đã gửi.');
            }

            await thongBaoRepository.deleteNguoiNhan(thongBaoId, client);

            await thongBaoRepository.danhDauDaHuy(thongBaoId, client);

            await client.query('COMMIT');

            return await this.getChiTiet(thongBaoId);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async createTuDong(data) {
        const guiTatCa = data.guiTatCa === true;

        const doiTuong = this.chuanHoaDoiTuong(data.doiTuong || []);

        this.validatePhamVi(guiTatCa, doiTuong);

        if (!data.maSuKien) {
            throw new ApiError(400, 'Mã sự kiện thông báo tự động không được để trống.');
        }

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            if (!guiTatCa) {
                await this.validateDoiTuong(doiTuong, client);
            }

            const thongBao = await thongBaoRepository.create(
                {
                    tieuDe: data.tieuDe,

                    noiDung: data.noiDung,

                    guiTatCa,

                    tuDong: true,

                    maSuKien: data.maSuKien,

                    loaiThamChieu: data.loaiThamChieu || null,

                    thamChieuId: data.thamChieuId || null,

                    duongDan: data.duongDan || null,

                    trangThai: 10,

                    nguoiTaoId: data.nguoiTaoId || null,

                    thoiGianGui: null
                },
                client
            );

            await thongBaoRepository.saveDoiTuong(thongBao.id, doiTuong, client);

            await client.query('COMMIT');

            return await this.getChiTiet(thongBao.id);
        } catch (error) {
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    }

    async send(data, transactionClient = null) {
        const guiTatCa = data.guiTatCa === true;
        const doiTuong = this.chuanHoaDoiTuong(data.doiTuong || []);

        this.validatePhamVi(guiTatCa, doiTuong);

        if (!data.maSuKien) {
            throw new ApiError(400, 'Thiếu mã sự kiện thông báo.');
        }

        const ownsTransaction = !transactionClient;
        const client = transactionClient || await pool.connect();

        let thongBao;

        try {
            if (ownsTransaction) {
                await client.query('BEGIN');
            }

            if (!guiTatCa) {
                await this.validateDoiTuong(doiTuong, client);
            }

            const nguoiNhanIds = await this.resolveNguoiNhan(
                guiTatCa,
                doiTuong,
                client
            );

            if (!nguoiNhanIds.length) {
                throw new ApiError(400, 'Không có tài khoản nhận thông báo.');
            }

            thongBao = await thongBaoRepository.create(
                {
                    ...data,
                    guiTatCa,
                    tuDong: true,
                    trangThai: 10,
                    thoiGianGui: null
                },
                client
            );

            await thongBaoRepository.saveDoiTuong(
                thongBao.id,
                doiTuong,
                client
            );

            await thongBaoRepository.saveNguoiNhan(
                thongBao.id,
                nguoiNhanIds,
                client
            );

            await thongBaoRepository.danhDauDaGui(thongBao.id, client);

            if (ownsTransaction) {
                await client.query('COMMIT');
            }
        } catch (error) {
            if (ownsTransaction) {
                await client.query('ROLLBACK');
            }

            throw error;
        } finally {
            if (ownsTransaction) {
                client.release();
            }
        }

        return ownsTransaction
            ? this.getChiTiet(thongBao.id)
            : thongBao;
    }
}

module.exports = new ThongBaoService();
