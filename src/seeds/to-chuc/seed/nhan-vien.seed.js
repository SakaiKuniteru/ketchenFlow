const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/nhan-vien.data');

async function seedNhanVien() {
    console.log('Seeding dm_nhan_vien...');

    await seedHelper({
        table: 'dm_nhan_vien',

        unique: 'ma_nhan_vien',

        data,

        transform: async (client, item) => {
            const coSo = await client.query(
                `
                SELECT id
                FROM dm_co_so
                WHERE ma_co_so=$1
                `,
                [item.ma_co_so]
            );

            const phongBan = await client.query(
                `
                SELECT id
                FROM dm_phong_ban
                WHERE ma_phong_ban=$1
                `,
                [item.ma_phong_ban]
            );

            const chucVu = await client.query(
                `
                SELECT id
                FROM dm_chuc_vu
                WHERE ma_chuc_vu=$1
                `,
                [item.ma_chuc_vu]
            );

            return {
                ma_nhan_vien: item.ma_nhan_vien,

                ho_ten: item.ho_ten,

                email: item.email,

                so_dien_thoai: item.so_dien_thoai,

                co_so_id: coSo.rows[0].id,

                phong_ban_id: phongBan.rows[0].id,

                chuc_vu_id: chucVu.rows[0].id,

                gioi_tinh: item.gioi_tinh,

                active: item.active
            };
        }
    });

    console.log('✓ dm_nhan_vien completed');
}

module.exports = seedNhanVien;
