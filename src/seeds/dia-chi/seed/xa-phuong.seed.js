const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/xa-phuong.data');

async function seedXaPhuong() {
    console.log('Seeding dm_xa_phuong...');

    await seedHelper({
        table: 'dm_xa_phuong',

        unique: 'ma_xa_phuong',

        data,

        transform: async (client, item) => {
            const tinhThanh = await client.query(
                `
                SELECT id
                FROM dm_tinh_thanh
                WHERE ma_tinh_thanh = $1
                `,
                [item.ma_tinh_thanh]
            );

            if (tinhThanh.rows.length === 0) {
                throw new Error(`Không tìm thấy tỉnh thành: ${item.ma_tinh_thanh}`);
            }

            return {
                ma_xa_phuong: item.ma_xa_phuong,

                ten_xa_phuong: item.ten_xa_phuong,

                tinh_thanh_id: tinhThanh.rows[0].id,

                active: item.active
            };
        }
    });

    console.log('✓ dm_xa_phuong completed');
}

module.exports = seedXaPhuong;
