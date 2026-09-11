const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/thiet-lap.data');

async function seedThietLap() {
    console.log('Seeding dm_thiet_lap...');

    await seedHelper({
        table: 'dm_thiet_lap',

        unique: 'ma_thiet_lap',

        data,

        transform: async (client, item) => {
            return {
                ma_thiet_lap: item.ma_thiet_lap,

                ten_thiet_lap: item.ten_thiet_lap,

                gia_tri: item.gia_tri,

                mo_ta: item.mo_ta,

                active: item.active
            };
        }
    });

    console.log('✓ dm_thiet_lap completed');
}

module.exports = seedThietLap;
