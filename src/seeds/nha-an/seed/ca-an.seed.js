const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/ca-an.data');

async function seedCaAn() {
    console.log('Seeding dm_ca_an...');

    await seedHelper({
        table: 'dm_ca_an',

        unique: 'ma_ca_an',

        data
    });

    console.log('✓ dm_ca_an completed');
}

module.exports = seedCaAn;
