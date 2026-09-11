'use strict';

// Cùng một bộ partial cho Express và các vùng giao diện cập nhật từ API.
const fs = require('node:fs');
const path = require('node:path');
const handlebars = require('handlebars');
const partialRoot = path.resolve(__dirname, '../../views/partials');
let cached;

function buildTemplates() {
    const chunks = [fs.readFileSync(require.resolve('handlebars/dist/handlebars.runtime.js'), 'utf8')];
    function visit(directory) {
        for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
            const filename = path.join(directory, item.name);
            if (item.isDirectory()) visit(filename);
            else if (item.name.endsWith('.hbs')) {
                const name = path
                    .relative(partialRoot, filename)
                    .replace(/\\/g, '/')
                    .replace(/\.hbs$/, '');
                chunks.push(
                    `Handlebars.registerPartial(${JSON.stringify(name)}, Handlebars.template(${handlebars.precompile(fs.readFileSync(filename, 'utf8'))}));`
                );
            }
        }
    }
    visit(path.join(partialRoot, 'dat-hang'));
    visit(path.join(partialRoot, 'forms'));
    return chunks.join('\n');
}

module.exports = (req, res, next) => {
    try {
        if (!cached || process.env.NODE_ENV !== 'production') cached = buildTemplates();
        res.type('application/javascript').send(cached);
    } catch (error) {
        next(error);
    }
};
