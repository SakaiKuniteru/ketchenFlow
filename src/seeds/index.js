const seedNhomTinhNang = require('./xac-thuc/seed/nhom-tinh-nang.seed');
const seedQuyen = require('./xac-thuc/seed/quyen.seed');
const seedQuyenNhomTinhNang = require('./xac-thuc/seed/quyen-nhom-tinh-nang.seed');
const seedVaiTro = require('./xac-thuc/seed/vai-tro.seed');
const seedVaiTroQuyen = require('./xac-thuc/seed/vai-tro-quyen.seed');
const seedTaiKhoan = require('./xac-thuc/seed/tai-khoan.seed');
const seedTaiKhoanVaiTro = require('./xac-thuc/seed/tai-khoan-vai-tro.seed');
const seedCoSo = require('./to-chuc/seed/co-so.seed');
const seedChucVu = require('./to-chuc/seed/chuc-vu.seed');
const seedPhongBan = require('./to-chuc/seed/phong-ban.seed');
const seedNhanVien = require('./to-chuc/seed/nhan-vien.seed');
const seedDonViTinh = require('./nha-an/seed/don-vi-tinh.seed');
const seedCaAn = require('./nha-an/seed/ca-an.seed');
const seedNhaAn = require('./nha-an/seed/nha-an.seed');
const seedNhomMonAn = require('./nha-an/seed/nhom-mon-an.seed');
const seedThucPham = require('./nha-an/seed/thuc-pham.seed');
const seedThietLap = require('./he-thong/seed/thiet-lap.seed');
const seedBaoCao = require('./he-thong/seed/bao-cao.seed');
const seedQuocGia = require('./dia-chi/seed/quoc-gia.seed');
const seedTinhThanh = require('./dia-chi/seed/tinh-thanh.seed');
const seedXaPhuong = require('./dia-chi/seed/xa-phuong.seed');

async function runSeed() {
    console.log('==========================');
    console.log('KitchenFlow Seed');
    console.log('==========================');

    await seedNhomTinhNang();
    await seedQuyen();
    await seedQuyenNhomTinhNang();
    await seedVaiTro();
    await seedVaiTroQuyen();
    await seedCoSo();
    await seedChucVu();
    await seedPhongBan();
    await seedNhanVien();
    await seedThietLap();
    await seedTaiKhoan();
    await seedTaiKhoanVaiTro();
    await seedDonViTinh();
    await seedCaAn();
    await seedNhaAn();
    await seedDonViTinh();
    await seedNhomMonAn();
    await seedThucPham();
    await seedQuocGia();
    await seedTinhThanh();
    await seedXaPhuong();
    await seedBaoCao();

    console.log('==========================');
    console.log('Seed Complete');
    console.log('==========================');

    process.exit();
}

runSeed();
