const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/tinh-thanh.data');

async function seedTinhThanh() {
    console.log('Seeding dm_tinh_thanh...');

    await seedHelper({
        table: 'dm_tinh_thanh',

        unique: 'ma_tinh_thanh',

        data,

        transform: async (client, item) => {
            const quocGia = await client.query(
                `
                SELECT id
                FROM dm_quoc_gia
                WHERE ma_quoc_gia = $1
                `,
                [item.ma_quoc_gia]
            );

            if (quocGia.rows.length === 0) {
                throw new Error(`Không tìm thấy quốc gia: ${item.ma_quoc_gia}`);
            }

            return {
                ma_tinh_thanh: item.ma_tinh_thanh,

                ten_tinh_thanh: item.ten_tinh_thanh,

                quoc_gia_id: quocGia.rows[0].id,

                active: item.active
            };
        }
    });

    console.log('✓ dm_tinh_thanh completed');
}

module.exports = seedTinhThanh;
