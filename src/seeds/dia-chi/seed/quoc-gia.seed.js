const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/quoc-gia.data');

async function seedQuocGia() {
    console.log('Seeding dm_quoc_gia...');

    await seedHelper({
        table: 'dm_quoc_gia',

        unique: 'ma_quoc_gia',

        data,

        transform: async (client, item) => {
            return {
                ma_quoc_gia: item.maQuocGia,

                ten_quoc_gia: item.tenQuocGia,

                ten_quoc_gia_en: item.tenQuocGiaEn,

                ten_viet_tat: item.tenVietTat,

                ma_iso2: item.maIso2,

                ma_iso3: item.maIso3,

                active: item.active
            };
        }
    });

    console.log('✓ dm_quoc_gia completed');
}

module.exports = seedQuocGia;
