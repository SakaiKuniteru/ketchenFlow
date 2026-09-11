const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/tai-khoan-vai-tro.data');

async function seedTaiKhoanVaiTro() {
    console.log('Seeding dm_tai_khoan_vai_tro...');

    await seedHelper({
        table: 'dm_tai_khoan_vai_tro',

        unique: 'tai_khoan_id,vai_tro_id',

        data,

        transform: async (client, item) => {
            const taiKhoan = await client.query(
                `
                SELECT id
                FROM dm_tai_khoan
                WHERE ten_dang_nhap = $1
                `,
                [item.ten_dang_nhap]
            );

            if (taiKhoan.rows.length === 0) {
                throw new Error(`Không tìm thấy tài khoản: ${item.ten_dang_nhap}`);
            }

            const vaiTro = await client.query(
                `
                SELECT id
                FROM dm_vai_tro
                WHERE ma_vai_tro = $1
                `,
                [item.ma_vai_tro]
            );

            if (vaiTro.rows.length === 0) {
                throw new Error(`Không tìm thấy vai trò: ${item.ma_vai_tro}`);
            }

            return {
                tai_khoan_id: taiKhoan.rows[0].id,

                vai_tro_id: vaiTro.rows[0].id,

                active: item.active
            };
        }
    });

    console.log('✓ dm_tai_khoan_vai_tro completed');
}

module.exports = seedTaiKhoanVaiTro;
