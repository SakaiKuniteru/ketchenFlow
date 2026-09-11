const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/bao-cao.data');

async function seedBaoCao() {
    console.log('Seeding dm_bao_cao...');

    await seedHelper({
        table: 'dm_bao_cao',

        unique: 'ma_bao_cao',

        data,

        transform: async (client, item) => {
            return {
                ma_bao_cao: item.maBaoCao,

                ten_bao_cao: item.tenBaoCao,

                file_mau: item.fileMau || null,

                loai_xuat_file: item.loaiXuatFile ?? null,

                mo_ta: item.moTa || null,

                active: item.active !== undefined ? item.active : true
            };
        }
    });

    console.log('✓ dm_bao_cao completed');
}

module.exports = seedBaoCao;
