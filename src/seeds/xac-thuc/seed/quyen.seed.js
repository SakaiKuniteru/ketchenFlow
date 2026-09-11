// const seedHelper = require("../../helpers/seed.helper");

// const data = require("../data/quyen.data");

// async function seedQuyen() {

//     console.log("Seeding dm_quyen...");

//     await seedHelper({

//         table: "dm_quyen",

//         unique: "ma_quyen",

//         data,

//         transform: async (client, item)=>{

//             const result = await client.query(

//                 `
//                 SELECT id
//                 FROM dm_nhom_tinh_nang
//                 WHERE ma_nhom_tinh_nang = $1
//                 `,

//                 [
//                     item.nhom_tinh_nang
//                 ]

//             );

//             if(result.rows.length === 0){

//                 throw new Error(
//                     `Không tồn tại nhóm quyền: ${item.nhom_tinh_nang}`
//                 );

//             }

//             delete item.nhom_tinh_nang;

//             return {

//                 ...item,

//                 nhom_tinh_nang_id:
//                     result.rows[0].id

//             };

//         }

//     });

//     console.log("✓ dm_quyen completed");

// }

// module.exports = seedQuyen;

const seedHelper = require('../../helpers/seed.helper');

const data = require('../data/quyen.data');

async function seedQuyen() {
    console.log('Seeding dm_quyen...');

    await seedHelper({
        table: 'dm_quyen',

        unique: 'ma_quyen',

        data
    });

    console.log('✓ dm_quyen completed');
}

module.exports = seedQuyen;
