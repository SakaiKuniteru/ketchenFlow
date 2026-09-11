const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/vai-tro.data');

async function seedVaiTro() {
    console.log('Seeding dm_vai_tro...');

    await seedHelper({
        table: 'dm_vai_tro',

        unique: 'ma_vai_tro',

        data
    });

    console.log('✓ dm_vai_tro completed');
}

module.exports = seedVaiTro;
