const ApiError = require('../utils/api-error');

const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const message = error.details.map((item) => item.message).join(', ');

            return next(new ApiError(400, message));
        }

        req.body = value;

        next();
    };
};

module.exports = validate;
