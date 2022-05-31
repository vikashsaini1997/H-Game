module.exports = validateRequest;

function validateRequest(req, next, schema) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    
    if (error) {
        
        throw error.details[0].message.replace(/[|&;$%@"<>()+,]/g, "")
        
    } else {
        req.body = value;
        next();
    }
}
