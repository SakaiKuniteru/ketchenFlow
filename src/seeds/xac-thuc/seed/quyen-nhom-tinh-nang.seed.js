const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/quyen-nhom-tinh-nang.data');

const seedQuyenNhomTinhNang = async () => {
    console.log('Seeding dm_quyen_nhom_tinh_nang...');

    await seedHelper({
        table: 'dm_quyen_nhom_tinh_nang',

        unique: ['quyen_id', 'nhom_tinh_nang_id'],

        data,

        transform: async (client, item) => {
            const quyenResult = await client.query(
                `
                                SELECT
                                    id
                                FROM dm_quyen
                                WHERE UPPER(
                                    TRIM(ma_quyen)
                                ) = UPPER(
                                    TRIM($1)
                                )
                                LIMIT 1
                            `,
                [item.ma_quyen]
            );

            if (quyenResult.rows.length === 0) {
                throw new Error(`Không tìm thấy quyền có mã: ${item.ma_quyen}`);
            }

            const nhomTinhNangResult = await client.query(
                `
                                SELECT
                                    id
                                FROM dm_nhom_tinh_nang
                                WHERE UPPER(
                                    TRIM(ma_nhom_tinh_nang)
                                ) = UPPER(
                                    TRIM($1)
                                )
                                LIMIT 1
                            `,
                [item.ma_nhom_tinh_nang]
            );

            if (nhomTinhNangResult.rows.length === 0) {
                throw new Error(`Không tìm thấy nhóm tính năng có mã: ${item.ma_nhom_tinh_nang}`);
            }

            return {
                quyen_id: quyenResult.rows[0].id,

                nhom_tinh_nang_id: nhomTinhNangResult.rows[0].id,

                active: item.active ?? true
            };
        }
    });

    console.log('✓ dm_quyen_nhom_tinh_nang completed');
};

module.exports = seedQuyenNhomTinhNang;
