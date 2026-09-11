const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/nhom-tinh-nang.data');

async function seedNhomQuyen() {
    console.log('Seeding dm_quyen...');

    await seedHelper({
        table: 'dm_nhom_tinh_nang',

        unique: 'ma_nhom_tinh_nang',

        data
    });

    console.log('✓ dm_nhom_tinh_nang completed');
}

module.exports = seedNhomQuyen;
