const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/thuc-pham.data');

async function seedThucPham() {
    console.log('Seeding dm_thuc_pham...');

    await seedHelper({
        table: 'dm_thuc_pham',

        unique: 'ma_thuc_pham',

        data,

        transform: async (client, item) => {
            const donViSoCap = await client.query(
                `
        SELECT id
        FROM dm_don_vi_tinh
        WHERE ma_don_vi_tinh=$1
        `,
                [item.ma_don_vi_so_cap]
            );

            const donViSuDung = await client.query(
                `
        SELECT id
        FROM dm_don_vi_tinh
        WHERE ma_don_vi_tinh=$1
        `,
                [item.ma_don_vi_su_dung]
            );

            return {
                ma_thuc_pham: item.ma_thuc_pham,

                ten_thuc_pham: item.ten_thuc_pham,

                don_vi_so_cap_id: donViSoCap.rows[0].id,

                don_vi_su_dung_id: donViSuDung.rows[0].id,

                he_so_quy_doi: item.he_so_quy_doi,

                active: item.active
            };
        }
    });

    console.log('✓ dm_thuc_pham completed');
}

module.exports = seedThucPham;
