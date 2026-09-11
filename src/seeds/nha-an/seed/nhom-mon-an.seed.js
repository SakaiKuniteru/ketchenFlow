const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/nhom-mon-an.data');

async function seedNhomMonAn() {
    console.log('Seeding dm_nhom_mon_an...');

    await seedHelper({
        table: 'dm_nhom_mon_an',

        unique: 'ma_nhom_mon_an',

        data
    });

    console.log('✓ dm_nhom_mon_an completed');
}

module.exports = seedNhomMonAn;
