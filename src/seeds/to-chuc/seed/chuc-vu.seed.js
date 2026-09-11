const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/chuc-vu.data');

async function seedChucVu() {
    console.log('Seeding dm_chuc_vu...');

    await seedHelper({
        table: 'dm_chuc_vu',

        unique: 'ma_chuc_vu',

        data
    });

    console.log('✓ dm_chuc_vu completed');
}

module.exports = seedChucVu;
