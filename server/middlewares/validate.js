const Joi = require('joi');

module.exports = (schema) => {
    return (req, res, next) => {
        const validationSchema = Joi.object({
            body: schema.body || Joi.any(),
            query: schema.query || Joi.any(),
            params: schema.params || Joi.any()
        });

        const { error } = validationSchema.validate({
            body: req.body,
            query: req.query,
            params: req.params
        }, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return res.status(400).json({ errors });
        }

        next();
    };
};