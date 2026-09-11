const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const setupView = require('./config/view');
const errorMiddleware = require('./middlewares/error.middleware');
const webRoute = require('./routes/web/index');
const apiRoute = require('./routes/api/index');
const { GIOI_TINH_OPTIONS } = require('./constants/form-options');

const app = express();

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(
    cors({
        credentials: true
    })
);

app.use(morgan('dev'));
app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());

app.use(express.static(path.join(process.cwd(), 'src/public')));

setupView(app);

app.use((req, res, next) => {
    res.locals.formOptions = {
        gioiTinh: GIOI_TINH_OPTIONS
    };

    next();
});

app.use('/api/mcs/v1', apiRoute);
app.use('/', webRoute);

app.get('/test', (req, res) => {
    res.send('OK');
});

app.use(errorMiddleware);

module.exports = app;
