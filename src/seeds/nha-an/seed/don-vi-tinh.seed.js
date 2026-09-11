const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/don-vi-tinh.data');

async function seedDonViTinh() {
    console.log('Seeding dm_don_vi_tinh...');

    await seedHelper({
        table: 'dm_don_vi_tinh',

        unique: 'ma_don_vi_tinh',

        data
    });

    console.log('✓ dm_don_vi_tinh completed');
}

module.exports = seedDonViTinh;
