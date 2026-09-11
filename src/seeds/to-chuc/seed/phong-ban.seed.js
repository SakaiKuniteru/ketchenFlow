const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/phong-ban.data');

async function seedPhongBan() {
    console.log('Seeding dm_phong_ban...');

    await seedHelper({
        table: 'dm_phong_ban',

        unique: 'ma_phong_ban',

        data
    });

    console.log('✓ dm_phong_ban completed');
}

module.exports = seedPhongBan;
