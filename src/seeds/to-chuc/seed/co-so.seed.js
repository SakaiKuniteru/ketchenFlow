const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/co-so.data');

async function seedCoSo() {
    console.log('Seeding dm_co_so...');

    await seedHelper({
        table: 'dm_co_so',

        unique: 'ma_co_so',

        data
    });

    console.log('✓ dm_co_so completed');
}

module.exports = seedCoSo;
