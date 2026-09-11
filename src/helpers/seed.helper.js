const db = require('../../config/database');

/**
 * Generic Seed Helper
 *
 * @param {Object} options
 * @param {String} options.table
 * @param {String} options.unique
 * @param {Array} options.data
 */

async function seedHelper({ table, unique, data }) {
    if (!table) {
        throw new Error('table is required');
    }

    if (!unique) {
        throw new Error('unique is required');
    }

    if (!Array.isArray(data)) {
        throw new Error('data must be array');
    }

    console.log(`Seeding ${table}...`);

    for (const item of data) {
        const columns = Object.keys(item);

        const values = Object.values(item);

        const placeholders = values.map((_, index) => `$${index + 1}`);

        const sql = `
            INSERT INTO ${table}
            (${columns.join(',')})

            VALUES
            (${placeholders.join(',')})

            ON CONFLICT (${unique})

            DO NOTHING
        `;

        await db.query(sql, values);
    }

    console.log(`✓ ${table} completed`);
}

module.exports = seedHelper;
