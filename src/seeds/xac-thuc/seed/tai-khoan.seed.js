const md5 = require('../../../utils/md5');

const seedHelper = require('../../helpers/seed.helper');
const data = require('../data/tai-khoan.data');

async function seedTaiKhoan() {
    console.log('Seeding dm_tai_khoan...');

    await seedHelper({
        table: 'dm_tai_khoan',

        unique: 'ten_dang_nhap',

        data,

        transform: async (client, item) => {
            const nhanVien = await client.query(
                `
        SELECT id
        FROM dm_nhan_vien
        WHERE ma_nhan_vien = $1
        `,
                [item.ma_nhan_vien]
            );

            if (nhanVien.rows.length === 0) {
                throw new Error(`Không tìm thấy nhân viên: ${item.ma_nhan_vien}`);
            }

            let matKhau = item.mat_khau;

            if (!matKhau) {
                const thietLap = await client.query(
                    `
            SELECT gia_tri
            FROM dm_thiet_lap
            WHERE ma_thiet_lap = 'MAT_KHAU_MAC_DINH'
            LIMIT 1
            `
                );

                if (thietLap.rows.length === 0) {
                    throw new Error('Không tìm thấy thiết lập MAT_KHAU_MAC_DINH.');
                }

                matKhau = thietLap.rows[0].gia_tri;
            }

            return {
                nhan_vien_id: nhanVien.rows[0].id,

                ten_dang_nhap: item.ten_dang_nhap,

                mat_khau_hash: md5.hash(matKhau),

                active: item.active
            };
        }
    });

    console.log('✓ dm_tai_khoan completed');
}

module.exports = seedTaiKhoan;
