const path = require('path');

const { engine } = require('express-handlebars');

module.exports = function (app) {
    app.engine(
        'hbs',
        engine({
            extname: 'hbs',

            helpers: {
                eq: (left, right) => left === right,
                gt: (left, right) => Number(left) > Number(right)
            },

            defaultLayout: 'main',

            layoutsDir: path.join(process.cwd(), 'src/views/layouts'),

            partialsDir: path.join(process.cwd(), 'src/views/partials')
        })
    );

    app.set('view engine', 'hbs');

    app.set('views', path.join(process.cwd(), 'src/views'));
};
