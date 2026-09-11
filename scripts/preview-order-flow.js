'use strict';

// Preview/test local với dữ liệu trong bộ nhớ. Không ghi vào PostgreSQL.
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const enums = require('../src/constants/enums');
const app = express();
app.use(express.json());
const user = { nhanVienId: 900001, taiKhoanId: 900001, hoTen: 'Nguyễn Thị Lan', soDienThoai: '0901234567',
    coSoId: 1, phongBan: { tenPhongBan: 'Phòng Hành chính' }, dsQuyen: ['Q002031', 'Q002032', 'Q002033'].map(maQuyen => ({ maQuyen })) };
const products = [
    ['Cơm gà nướng', 35000, 10, 'Cơm trắng dẻo thơm, gà nướng đậm vị, kèm rau củ.'],
    ['Bún bò', 40000, 10, 'Bún bò thơm ngon, đậm đà hương vị.'],
    ['Cà phê sữa', 20000, 20, 'Cà phê truyền thống, vị đậm đà.'],
    ['Trà đào', 25000, 20, 'Trà đen thanh mát, đào tươi thơm ngon.'],
    ['Bánh flan', 15000, 30, 'Bánh flan mềm mịn, béo ngậy.'],
    ['In tài liệu', 5000, 40, 'In ấn tài liệu nhanh chóng, chất lượng cao.'],
    ['Đặt phòng họp', 100000, 40, 'Phòng họp tiện lợi, đầy đủ thiết bị.'],
    ['Hỗ trợ sự kiện', 200000, 40, 'Hỗ trợ tổ chức sự kiện nội bộ chuyên nghiệp.'],
    ['Pha trà / coffee break', 50000, 40, 'Trà, cà phê, bánh ngọt cho cuộc họp.']
].map(([tenSanPham, giaBan, loaiSanPham, moTa], i) => ({ id: i + 1, tenSanPham, giaBan, loaiSanPham, moTa,
    tenNhomSanPham: enums.loaiSanPham.find(row => row.value === loaiSanPham).name, nhomSanPhamId: loaiSanPham,
    tenDonViTinh: i === 5 ? 'trang' : i === 6 ? 'giờ' : i === 8 ? 'người' : 'phần',
    hinhAnh: i === 0 ? '/uploads/danh-muc/mon-an/MA0001/thit-ga-luoc-ma0001.png' : '',
    soLuongToiThieu: 1, soLuongToiDa: 10, buocSoLuong: 1, laSanPhamNoiBat: [0, 2].includes(i), laSanPhamMoi: i === 3 }));
const orders = [], transactions = [];
const ok = (res, data) => res.json({ success: true, data });
function quote(body) {
    const items = body.items.map(row => {
        const product = products.find(item => item.id === Number(row.sanPhamId));
        if (!product || row.soLuong < 1 || row.soLuong > 10) throw new Error('Số lượng sản phẩm không hợp lệ.');
        return { ...product, sanPhamId: product.id, soLuong: row.soLuong, donGia: product.giaBan, thanhTien: product.giaBan * row.soLuong };
    });
    if (body.maVoucher && body.maVoucher.toUpperCase() !== 'KITCHEN5K') throw new Error('Voucher không tồn tại hoặc đã ngừng áp dụng.');
    const tamTinh = items.reduce((sum, row) => sum + row.thanhTien, 0), tongMienGiam = body.maVoucher ? Math.round(tamTinh * .05) : 0;
    return { items, tamTinh, tongMienGiam, phiDichVu: 0, tongThanhToan: tamTinh - tongMienGiam,
        voucher: body.maVoucher ? { maVoucher: 'KITCHEN5K', soTienGiam: tongMienGiam } : null };
}
app.get('/assets/js/common/app.js', (req, res) => {
    const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url');
    const token = `preview.${payload}.preview`;
    res.type('js').send(`localStorage.setItem('accessToken', ${JSON.stringify(token)}); localStorage.setItem('refreshToken', ${JSON.stringify(token)});\n` + fs.readFileSync(path.resolve('src/public/assets/js/common/app.js'), 'utf8'));
});
app.get('/api/mcs/v1/auth/nhan-vien-hien-tai', (req, res) => ok(res, user));
app.get('/api/mcs/v1/enums', (req, res) => ok(res, enums));
app.get('/api/mcs/v1/dat-hang/catalog/san-pham', (req, res) => {
    const items = products.filter(row => (!req.query.loaiSanPham || row.loaiSanPham === Number(req.query.loaiSanPham))
        && (!req.query.nhomSanPhamId || row.nhomSanPhamId === Number(req.query.nhomSanPhamId))
        && (!req.query.laSanPhamMoi || row.laSanPhamMoi)
        && (!req.query.keyword || row.tenSanPham.toLocaleLowerCase('vi').includes(req.query.keyword.toLocaleLowerCase('vi'))));
    ok(res, { items, pagination: { page: 1, limit: 12, total: items.length, totalPages: 1 } });
});
app.get('/api/mcs/v1/dat-hang/catalog/thong-tin-checkout', (req, res) => {
    const date = req.query.ngayNhan || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    ok(res, { nguoiDat: user, ngayNhan: date, soPhutDatTruoc: 15,
        nhomSanPham: enums.loaiSanPham.map(item => ({ id: item.value, tenNhomSanPham: item.name })),
        diaDiemNhanHang: [{ id: 1, tenDiaDiem: 'Văn phòng tầng 3', moTaDiaChi: 'Văn phòng tầng 3, phòng họp nhỏ', laMacDinh: true }],
        khungGioNhanHang: [{ id: 1, tenKhungGio: 'Buổi trưa', gioBatDau: '11:45:00', gioKetThuc: '12:00:00', soChoConLai: 20,
            thoiGianNhanTu: `${date}T11:45:00+07:00`, thoiGianNhanDen: `${date}T12:00:00+07:00` }] });
});
app.post('/api/mcs/v1/dat-hang/catalog/tinh-gio-hang', (req, res) => { try { ok(res, quote(req.body)); } catch (e) { res.status(400).json({ message: e.message }); } });
app.post('/api/mcs/v1/nv-don-hang/tao-moi', (req, res) => {
    const previous = orders.find(order => order.clientRequestId === req.body.clientRequestId); if (previous) return ok(res, previous);
    const body = req.body, cart = quote(body), now = new Date().toISOString(), id = orders.length + 1;
    const order = { ...body, id, maDonHang: `DH${String(id).padStart(7, '0')}`, nguoiDat: user, phongBan: user.phongBan,
        nguoiNhan: { hoTen: body.tenNguoiNhan, soDienThoai: body.soDienThoaiNguoiNhan }, coSo: { id: 1 },
        diaDiemNhan: { tenDiaDiem: 'Văn phòng tầng 3', diaChi: body.diaChiNhan },
        khungGioNhan: { tu: body.thoiGianNhanTu, den: body.thoiGianNhanDen }, items: cart.items, tien: cart,
        vouchers: cart.voucher ? [cart.voucher] : [], payments: [], history: [{ createdAt: now, trangThaiMoi: 20, noiDung: 'Đơn hàng được tạo và gửi chờ xác nhận.', tenNguoiThucHien: user.hoTen }],
        createdAt: now, updatedAt: now, trangThai: 20, trangThaiThanhToan: 10, version: 1 };
    orders.unshift(order); ok(res, order);
});
for (const route of ['cua-toi', 'quan-ly']) app.get(`/api/mcs/v1/nv-don-hang/${route}`, (req, res) => {
    const filtered = orders.filter(order => (!req.query.trangThai || order.trangThai === Number(req.query.trangThai))
        && (!req.query.trangThaiThanhToan || order.trangThaiThanhToan === Number(req.query.trangThaiThanhToan))
        && (!req.query.keyword || `${order.maDonHang} ${order.nguoiNhan.hoTen}`.toLowerCase().includes(req.query.keyword.toLowerCase())));
    const items = filtered.map(order => ({ ...order, thoiGianDat: order.createdAt, nguoiDat: order.nguoiDat.hoTen,
        nguoiNhan: order.nguoiNhan.hoTen, soLoai: order.items.length, tongSoLuong: order.items.reduce((sum, row) => sum + row.soLuong, 0), tongThanhToan: order.tien.tongThanhToan }));
    ok(res, { items, pagination: { page: 1, limit: 8, total: items.length, totalPages: Math.ceil(items.length / 8) },
        thongKe: { choXacNhan: orders.filter(o => o.trangThai === 20).length, dangChuanBi: orders.filter(o => o.trangThai === 30).length,
            sanSangVaDangGiao: orders.filter(o => [40, 50].includes(o.trangThai)).length, hoanThanh: orders.filter(o => o.trangThai === 60).length } });
});
for (const route of ['/:id', '/quan-ly/:id']) app.get(`/api/mcs/v1/nv-don-hang${route}`, (req, res) => {
    const order = orders.find(o => o.id === Number(req.params.id)); if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn.' }); ok(res, order);
});
for (const route of ['/:id/:action', '/quan-ly/:id/:action']) app.patch(`/api/mcs/v1/nv-don-hang${route}`, (req, res) => {
    const order = orders.find(o => o.id === Number(req.params.id));
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn.' });
    if (req.body.version !== order.version) return res.status(409).json({ message: 'Đơn đã được cập nhật. Vui lòng tải lại.' });
    const target = { 'xac-nhan': 30, 'tu-choi': -20, huy: -10, 'san-sang-giao': 40, 'bat-dau-giao': 50, 'hoan-thanh': 60 }[req.params.action];
    order.trangThai = target; order.version++; order.nguoiXuLy = user; order.lyDoHuy = target < 0 ? req.body.lyDo : null;
    order.history.push({ createdAt: new Date().toISOString(), trangThaiMoi: target, tenTrangThaiMoi: enums.trangThaiDonHang.find(row => row.value === target).name, tenNguoiThucHien: user.hoTen });
    ok(res, order);
});
app.post('/api/mcs/v1/nv-thanh-toan-don-hang/:id/khoi-tao', async (req, res) => {
    const order = orders.find(o => o.id === Number(req.params.id));
    let transaction = transactions.find(row => row.orderId === order.id);
    if (!transaction) { transaction = { orderId: order.id, maGiaoDich: 'PREVIEW-QR', qrPayload: await require('qrcode').toDataURL('PREVIEW ONLY') }; transactions.push(transaction); }
    ok(res, transaction);
});
app.use('/api', (req, res) => ok(res, { items: [], giaTri: '', unreadCount: 0 }));
app.use(require('../src/app'));
app.listen(Number(process.env.ORDER_PREVIEW_PORT || 3017), '127.0.0.1', () => console.log('Preview only: http://127.0.0.1:3017/dat-hang/dat-mon'));
