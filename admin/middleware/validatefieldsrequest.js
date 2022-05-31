module.exports = validateAllFieldsRequest;

function validateAllFieldsRequest(res, req, next, schema) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    
    if (error) {
       // console.log(error);
        let errorMessages = [];
   
        for(var i=0; i<error.details.length; i++){
            
            let errorData = {
                 "type" : error.details[i].path[0],
                 "message" : error.details[i].message.replace(/[|&;$%@"<>()+,]/g, "")
             }; 

             errorMessages.push(errorData);
        }
        return res.status(400).json({ errorMessage: errorMessages });        
    } else {
        req.body = value;
        next();
    }
}
