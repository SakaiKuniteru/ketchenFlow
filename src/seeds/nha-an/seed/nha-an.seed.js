const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/nha-an.data');

async function seedNhaAn() {
    console.log('Seeding dm_nha_an...');

    await seedHelper({
        table: 'dm_nha_an',

        unique: 'ma_nha_an',

        data
    });

    console.log('✓ dm_nha_an completed');
}

module.exports = seedNhaAn;
