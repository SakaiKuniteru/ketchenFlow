const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/vai-tro-quyen.data');

async function seedVaiTroQuyen() {
    console.log('Seeding dm_vai_tro_quyen...');

    await seedHelper({
        table: 'dm_vai_tro_quyen',

        unique: 'vai_tro_id,quyen_id',

        data,

        transform: async (client, item) => {
            const vaiTro = await client.query(
                `
                SELECT id
                FROM dm_vai_tro
                WHERE ma_vai_tro=$1
                `,
                [item.ma_vai_tro]
            );

            const quyen = await client.query(
                `
                SELECT id
                FROM dm_quyen
                WHERE ma_quyen=$1
                `,
                [item.ma_quyen]
            );

            return {
                vai_tro_id: vaiTro.rows[0].id,

                quyen_id: quyen.rows[0].id
            };
        }
    });

    console.log('✓ dm_vai_tro_quyen completed');
}

module.exports = seedVaiTroQuyen;
