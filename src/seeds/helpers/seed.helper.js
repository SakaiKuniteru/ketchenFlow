const pool = require('../../config/database');

/**
 * Seed Helper dùng chung cho toàn bộ bảng
 *
 * @param {
 *  table,
 *  unique,
 *  data,
 *  transform
 * }
 */

async function seedHelper({
    table,

    unique,

    data,

    transform = null
}) {
    if (!Array.isArray(data) || data.length === 0) {
        console.log(`⚠ ${table}: No data`);

        return;
    }

    const conflictColumns = Array.isArray(unique) ? unique.join(', ') : unique;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (let item of data) {
            if (transform) {
                item = await transform(client, {
                    ...item
                });
            }

            const columns = Object.keys(item);

            const values = Object.values(item);

            const placeholders = values.map((_, index) => `$${index + 1}`);

            const sql = `

                INSERT INTO ${table}

                (${columns.join(',')})

                VALUES

                (${placeholders.join(',')})


                ON CONFLICT (${conflictColumns})

                DO NOTHING

            `;

            await client.query(sql, values);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');

        throw error;
    } finally {
        client.release();
    }
}

module.exports = seedHelper;
